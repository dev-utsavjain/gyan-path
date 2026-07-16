// Platform contract: on backend deploy the platform rewrites this exact string
// literal to "<backendURL>/api". Keep it a plain literal — no env expression,
// no ?? / || / template — or the rewrite can't happen and requests hit the
// preview origin. BASE already carries /api; request paths are relative to it.
const BASE = '/api';

export default BASE;
