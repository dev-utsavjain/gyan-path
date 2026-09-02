# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

GyaanPath Digital — a course-selling site for a skill-development institute (Jabalpur, MP).
Two apps in one repo, deployed as **one** container:

- `frontend/` — React 19 + Vite + Tailwind v4 SPA (TypeScript, `react-router-dom` v7)
- `backend/` — Go 1.25 + Gin + GORM + Postgres, module name `imagine_backend`

The Go binary **embeds the built frontend**: `backend/internal/fs.go` does
`//go:embed all:dist` over `backend/internal/dist`. Any unmatched non-`/api/` route
serves `index.html` (SPA fallback), `/assets/*` serves the hashed bundle. There is
no separate frontend deploy — a frontend change ships only by rebuilding it, copying
`dist` into `backend/internal/dist`, and redeploying the backend.

## Commands

Frontend (`cd frontend`):

```bash
npm install
npm run dev      # vite on :3000, host 0.0.0.0
npm run build    # -> frontend/dist
npm run lint     # tsc --noEmit  (this is the only check; no test suite exists)
```

Backend (`cd backend`):

```bash
go run cmd/server/main.go      # migrates + seeds + serves on $PORT (default 8080)
go run cmd/migration/main.go   # migrate + seed only
go build ./... && go vet ./...
go test ./...                            # only internal/cloudinary has tests
go test ./internal/cloudinary/ -run TestSign -v   # a single test
```

The frontend has no test suite; on the Go side only `internal/cloudinary` does.
`npm run lint` (tsc), `go build`/`go vet` and `go test ./...` are the gates — run them
before claiming a change works.

Deploy (Railway, from `backend/`):

```bash
./redeploy.sh            # build frontend -> copy dist -> railway up -> verify live
./redeploy.sh --build    # build + copy dist only
./redeploy.sh --deploy   # railway up only
./redeploy.sh --setup    # one-time: create service, push .env vars
./redeploy.sh --db       # restart Postgres (frees "too many clients" slots)
```

`redeploy.sh` defaults `FRONTEND_DIR=../future-Skill`, which does **not** match this
repo's layout — run it as `FRONTEND_DIR=../frontend ./redeploy.sh`. The script's real
success signal is `verify_deploy`, which polls the live URL until it serves the exact
new bundle hash and `/api/health` returns 200; the Railway CLI often exits non-zero on
a dropped log stream even when the deploy succeeded.

## Architecture

### Request path

`BASE` in `frontend/src/lib/api.ts` is the plain literal `'/api'`. The deploy platform
rewrites that exact literal to the deployed backend URL — **keep it a literal**, no env
expression, no `??`/`||`/template, or the rewrite silently fails. `apiFetch` in
`src/api/client.ts` builds every request as `${BASE}/v1${path}` and optionally attaches
the admin bearer token from `localStorage['fs_admin_token']`. All backend routes are
registered in one place: `backend/internal/server/routes.go`.

### Boot sequence (`internal/server/server.go`)

`LoadConfig → ConnectToDB → Migrate → seed.Run → mail.Init → payment.Init`.
Migration runs **at server boot**, not only from `cmd/migration` — Railway's deploy runs
`start.sh`, which does run the migration binary first, but boot-time migrate is the
safeguard against a crash-loop → 502. `internal/db/migrate.go` is the single list of
migrated models; a new model must be added to that `AutoMigrate` call.

### Multi-tenant schema

Every deployment is pinned to one Postgres schema via `DB_SCHEMA`. It is in the DSN
(`search_path=…`) and `Migrate()` re-asserts it (`CREATE SCHEMA IF NOT EXISTS` +
`SET search_path`). `Migrate()` hard-fails if `DB_SCHEMA` is empty — never default it.

### Content is DB-driven, not hardcoded

These mechanisms let the admin change the site without a redeploy:

- **`models.Course`** — the whole homepage catalogue. Four categories
  (`basic`, `additional_support`, `premium`, `upcoming`) map to homepage sections;
  "unlocking" an upcoming course just means recategorising it. `Features` is a
  `serializer:json` column used by premium cards.
- **`models.Setting`** — flat `key → value` string table for copy and prices
  (`hero_title`, `plan_basic_price`, `contact_phone_raw`, …). `GET /v1/settings` returns
  the whole map; `PUT /v1/admin/settings` bulk-upserts and **accepts unknown keys on
  purpose**, so the frontend owns the schema. Adding a setting means: add it to
  `seed.seedSettings` defaults, to `DEFAULT_SETTINGS` in
  `frontend/src/context/SettingsContext.tsx` (the pre-fetch fallback — keep the two in
  sync), and to `SETTINGS_GROUPS` in `AdminPage.tsx` to make it editable.
- **`models.Coordinator`** — name + unique code (`GD001`) for the field employee a
  purchase is attributed to. `active` controls whether it appears in the enrollment
  dropdown; deleting one never rewrites past purchases, which keep the name and code
  they were made with.
- **`models.GalleryItem`** — photos and videos for `/gallery`. `featured` picks the ones
  the homepage strip pulls from (`GallerySection` falls back to most-recent when nothing
  is flagged, so the section is never an empty band).

`internal/seed/seed.go` is idempotent by design: settings are inserted only for missing
keys, courses only when the table is empty. It never clobbers admin edits.

### Gallery media lives in object storage, never in Postgres

`GalleryItem.url` is either a link an admin pasted or a Cloudinary URL from an upload —
both collapse to one column, so there is no blob storage and no upload path through Go.
Uploads work as: the admin browser asks `GET /v1/admin/gallery/upload-signature` →
`internal/cloudinary` signs it (sorted params + secret, SHA-1, stdlib only — no SDK) →
the browser `POST`s the bytes straight to Cloudinary → the returned URL and `public_id`
are saved via `POST /v1/admin/gallery`. Deleting a row also fires a best-effort
`cloudinary.Destroy` so uploads don't orphan.

Cloudinary is optional: with `CLOUDINARY_*` unset, `cloudinary.Enabled()` is false, the
signature endpoint returns 503 with a message telling the admin to paste a link
instead, and everything else still works. Per-file limits and accepted formats are
defined once in `frontend/src/api/gallery.ts` and rendered to the admin verbatim by
`UploadRules` in `GalleryTab.tsx` — change them in one place.

### Payments (Razorpay, manual verification — no webhook)

1. `POST /v1/payments/order` — creates the Razorpay order **and** writes a `pending`
   `models.Payment` row carrying the full enrollment form (student, father, age, mobile,
   email, qualification, address, coordinator).
2. Browser opens Razorpay Checkout (`frontend/src/api/payment.ts:startPayment`).
3. `POST /v1/payments/verify` is the authoritative fulfilment step: verify the checkout
   signature → re-fetch the payment server-side and require `status == "captured"` →
   `payment.MarkOrderPaid`, which is idempotent (`WHERE status <> 'paid'`) and, only on
   the first transition, fires the confirmation + owner-notification emails in a
   goroutine. Email failure must never undo a payment.
4. The browser then routes to `/thank-you` (`ThankYouPage`), whose whole job is pushing
   the student into the private WhatsApp group — class links are only shared there. The
   invite URL is the `whatsapp_group_link` setting, so it changes without a redeploy.

The form submits only `coordinator_code`; `CreatePaymentOrder` looks the coordinator up
and fills `coordinator_name` from the record, so a stored attribution can never have a
name that disagrees with its code. An empty code means "not applicable" and is allowed.

`internal/razorpay/` is a self-contained, reusable client (config, hooks interface,
signature verify, amount conversion); `internal/payment/` wires it to this app's DB and
config. `payment.Client` stays `nil` when Razorpay keys are absent so the server still
boots — handlers return 503.

### Admin auth

No user table. `POST /v1/admin/login` constant-time-compares against `ADMIN_USERNAME` /
`ADMIN_PASSWORD` env vars and issues a JWT with `role: "admin"`;
`middleware.AdminAuthMiddleware` guards the `/v1/admin/*` group. The admin UI is a `Tab`
union type in `frontend/src/pages/AdminPage.tsx` plus one `*Tab` component per tab
(Payments / Messages / Courses / Coordinators / Gallery / Settings). The first three and
Settings live inline in that file; the two larger newer ones are in
`frontend/src/components/admin/`. Adding a tab means extending the `Tab` type, adding a
`tabBtn(...)` line and a `{tab === '…' && <…/>}` line in `Dashboard`. Every tab takes
`{ onAuthError, showToast }` and handles `ApiError` with `status === 401` by calling
`onAuthError()` → logout.

### Email

`internal/mail/` — plain `net/smtp`, HTML templates in `templates.go`. Disabled (a
no-op with a log line) when `SMTP_HOST`/`SMTP_FROM` are unset; call `mail.Enabled()`
before offering an email-dependent action.

## Conventions

- **Handler shape**: Gin handlers live in `internal/handler/v1/`, one file per resource,
  named after the route. Bind into a private `xxxRequest` struct, then
  `normalize()`/`validate()` (see `course.go`), then act. Errors go back as
  `c.JSON(status, gin.H{"error": "lower-case message"})` and the frontend surfaces
  `data.error` verbatim — write messages a non-technical admin can read.
- **Responses are wrapped**, not bare arrays: `{"courses": [...]}`, `{"settings": {...}}`,
  `{"payments": [...], "total": n, "limit": n, "offset": n}`.
- **JSON is snake_case** on the wire; the matching TypeScript interface lives beside the
  fetch function in `frontend/src/api/<resource>.ts`. Public and admin calls for one
  resource share a file (`fetchCourses` vs `fetchAllCourses`).
- Models carry doc comments explaining *why* the table exists. Match that.
- Tailwind is used inline; the larger form components define a shared `input` class-string
  constant — reuse it rather than re-typing the classes.
- `cursor-target` is a hook for `SplashCursor`; `GlareHover` wraps CTA buttons.
- Course images are referenced by URL only (Unsplash for seeds, Cloudinary for the logo).
  Gallery media is the one thing that can be uploaded — see the object-storage section.
- **This project has no `@types/react`**, so `key` on a *custom* component is a type
  error. Put the `key` on a wrapping element instead (see `GalleryPage`/`GallerySection`).

## Gotchas

- Ports: frontend dev is `:3000`, backend is `:8080`. Dev has no proxy — the SPA's
  `/api` calls hit Vite unless you run against a deployed backend or add one.
- `backend/internal/dist` must exist for the Go build to succeed (`//go:embed all:dist`),
  and it is **tracked in git** — a frontend change is not really shipped until that copy
  is refreshed (`./redeploy.sh --build`, or `npm run build` + copy `frontend/dist` over
  it). Otherwise the binary keeps serving the old bundle.
- `frontend/node_modules` in this checkout was installed on Linux, so the native
  binaries for Windows are missing and `vite build` dies in `rollup/dist/native.js`. Fix
  with `npm install --no-save @rollup/rollup-win32-x64-msvc
  @tailwindcss/oxide-win32-x64-msvc lightningcss-win32-x64-msvc`. Same reason `npm run
  lint` fails on `tsc` not being found — run `node node_modules/typescript/bin/tsc
  --noEmit` instead.
- `frontend/.env` holds `VITE_RAZORPAY_KEY_ID` (a live key); `startPayment` prefers it
  and falls back to the `key_id` returned by the backend.
- `frontend/README.md` is leftover AI Studio boilerplate about `GEMINI_API_KEY` — the app
  does not use Gemini despite `@google/genai` being in `package.json`.
- `vite.config.ts` disables HMR/file-watching when `DISABLE_HMR=true`; leave that alone.
