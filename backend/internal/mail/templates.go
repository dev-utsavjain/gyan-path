package mail

import (
	"bytes"
	"fmt"
	"html/template"
	"strings"

	"imagine_backend/config"
	"imagine_backend/internal/models"
)

// layout wraps content in a simple, email-client-friendly HTML shell.
const layout = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        <tr><td style="background:#172554;padding:20px 28px;">
          <span style="color:#ffffff;font-size:18px;font-weight:bold;">{{.AppName}}</span>
        </td></tr>
        <tr><td style="padding:28px;">{{.Body}}</td></tr>
        <tr><td style="padding:18px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;">
          This is an automated message from {{.AppName}}.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

var layoutTmpl = template.Must(template.New("layout").Parse(layout))

func render(bodyHTML template.HTML) (string, error) {
	var buf bytes.Buffer
	err := layoutTmpl.Execute(&buf, map[string]interface{}{
		"AppName": config.AppConfig.AppName,
		"Body":    bodyHTML,
	})
	return buf.String(), err
}

func money(p models.Payment) string {
	cur := p.Currency
	if cur == "" {
		cur = "INR"
	}
	if cur == "INR" {
		return fmt.Sprintf("₹%d", p.Amount)
	}
	return fmt.Sprintf("%s %d", cur, p.Amount)
}

func rows(pairs [][2]string) template.HTML {
	var b strings.Builder
	b.WriteString(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">`)
	for _, p := range pairs {
		if p[1] == "" {
			continue
		}
		b.WriteString(`<tr>`)
		b.WriteString(`<td style="padding:6px 0;color:#6b7280;width:40%;">` + template.HTMLEscapeString(p[0]) + `</td>`)
		b.WriteString(`<td style="padding:6px 0;font-weight:bold;">` + template.HTMLEscapeString(p[1]) + `</td>`)
		b.WriteString(`</tr>`)
	}
	b.WriteString(`</table>`)
	return template.HTML(b.String())
}

func button(label, url string) template.HTML {
	return template.HTML(fmt.Sprintf(
		`<a href="%s" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:8px;">%s</a>`,
		template.HTMLEscapeString(url), template.HTMLEscapeString(label)))
}

// PaymentReceivedToUser builds the confirmation email sent to the student.
func PaymentReceivedToUser(p models.Payment) (subject, body string, err error) {
	name := p.StudentName
	if name == "" {
		name = "there"
	}
	detail := rows([][2]string{
		{"Course", p.CourseName},
		{"Amount paid", money(p)},
		{"Order ID", p.OrderID},
		{"Payment ID", p.PaymentID},
	})
	inner := template.HTML(fmt.Sprintf(`
		<h2 style="margin:0 0 12px;color:#172554;">Payment successful 🎉</h2>
		<p style="margin:0 0 16px;line-height:1.6;">Hi %s, thank you for enrolling with %s. Your payment has been received and your seat is confirmed.</p>
		<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:18px;">%s</div>
		<p style="margin:0 0 8px;line-height:1.6;">Our team will reach out with your class schedule and joining link shortly. You will receive the Google Meet link for live sessions by email.</p>
		<p style="margin:16px 0 0;line-height:1.6;">Welcome aboard,<br>The %s Team</p>`,
		template.HTMLEscapeString(name), template.HTMLEscapeString(config.AppConfig.AppName), string(detail), template.HTMLEscapeString(config.AppConfig.AppName)))

	html, err := render(inner)
	return fmt.Sprintf("Payment confirmed — %s", p.CourseName), html, err
}

// PaymentNotificationToOwner builds the internal notification email.
func PaymentNotificationToOwner(p models.Payment, adminURL string) (subject, body string, err error) {
	detail := rows([][2]string{
		{"Student", p.StudentName},
		{"Email", p.Email},
		{"Mobile", p.Mobile},
		{"Course", p.CourseName},
		{"Amount", money(p)},
		{"Order ID", p.OrderID},
		{"Payment ID", p.PaymentID},
		{"Qualification", p.Qualification},
		{"Coordinator", p.CoordinatorName},
	})
	var cta template.HTML
	if adminURL != "" {
		cta = template.HTML(`<p style="margin:18px 0 0;">` + string(button("Open Admin Dashboard", adminURL)) + `</p>`)
	}
	inner := template.HTML(fmt.Sprintf(`
		<h2 style="margin:0 0 12px;color:#172554;">New payment received</h2>
		<p style="margin:0 0 16px;line-height:1.6;"><strong>%s</strong> just paid <strong>%s</strong> for <strong>%s</strong>.</p>
		<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;">%s</div>
		%s`,
		template.HTMLEscapeString(p.StudentName), money(p), template.HTMLEscapeString(p.CourseName), string(detail), string(cta)))

	html, err := render(inner)
	return fmt.Sprintf("💰 New payment: %s — %s", p.StudentName, p.CourseName), html, err
}

// ContactMessageToOwner builds the email sent to the app owner when a visitor
// submits the public "Contact Us" form.
func ContactMessageToOwner(m models.ContactMessage, adminURL string) (subject, body string, err error) {
	detail := rows([][2]string{
		{"Name", m.Name},
		{"Email", m.Email},
		{"Phone", m.Phone},
	})

	safeMsg := template.HTMLEscapeString(m.Message)
	safeMsg = strings.ReplaceAll(safeMsg, "\n", "<br>")

	var cta template.HTML
	if adminURL != "" {
		cta = template.HTML(`<p style="margin:18px 0 0;">` + string(button("Open Admin Dashboard", adminURL)) + `</p>`)
	}

	inner := template.HTML(fmt.Sprintf(`
		<h2 style="margin:0 0 12px;color:#172554;">New contact message</h2>
		<p style="margin:0 0 16px;line-height:1.6;"><strong>%s</strong> sent a message through the website contact form.</p>
		<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">%s</div>
		<p style="margin:0 0 6px;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:.05em;">Message</p>
		<div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;line-height:1.6;">%s</div>
		%s`,
		template.HTMLEscapeString(m.Name), string(detail), safeMsg, string(cta)))

	html, err := render(inner)
	return fmt.Sprintf("📩 New contact message from %s", m.Name), html, err
}

// MeetLinkToUser builds the email an admin sends with a Google Meet link.
func MeetLinkToUser(p models.Payment, meetLink, message, when string) (subject, body string, err error) {
	name := p.StudentName
	if name == "" {
		name = "there"
	}

	var msgBlock template.HTML
	if strings.TrimSpace(message) != "" {
		safe := template.HTMLEscapeString(message)
		safe = strings.ReplaceAll(safe, "\n", "<br>")
		msgBlock = template.HTML(`<p style="margin:0 0 16px;line-height:1.6;">` + safe + `</p>`)
	}

	var whenBlock template.HTML
	if strings.TrimSpace(when) != "" {
		whenBlock = template.HTML(`<p style="margin:0 0 16px;"><strong>When:</strong> ` + template.HTMLEscapeString(when) + `</p>`)
	}

	inner := template.HTML(fmt.Sprintf(`
		<h2 style="margin:0 0 12px;color:#172554;">Your class link for %s</h2>
		<p style="margin:0 0 16px;line-height:1.6;">Hi %s,</p>
		%s
		%s
		<p style="margin:0 0 18px;">%s</p>
		<p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">If the button does not work, copy this link into your browser:<br><a href="%s">%s</a></p>`,
		template.HTMLEscapeString(p.CourseName), template.HTMLEscapeString(name),
		string(msgBlock), string(whenBlock),
		string(button("Join Google Meet", meetLink)),
		template.HTMLEscapeString(meetLink), template.HTMLEscapeString(meetLink)))

	html, err := render(inner)
	return fmt.Sprintf("Class link — %s", p.CourseName), html, err
}
