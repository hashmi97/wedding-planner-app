# Security

This document summarizes the security measures and hardening applied to the Wedding Planner application.

## Authentication

- **API auth**: All Netlify Functions require the `x-admin-token` header matching `ADMIN_TOKEN`. The comparison uses **constant-time** (`crypto.timingSafeEqual`) to prevent timing attacks.
- **Site password**: Optional `VITE_APP_PASSWORD` provides a casual client-side gate. It is not cryptographically robust—intended for light privacy (e.g., sharing a link with a password). For stronger protection, use Netlify’s built-in password protection or an auth provider.

## API Security

### Input Validation

- **UUID validation**: PUT and DELETE endpoints validate the `id` query parameter with a strict UUID regex before database operations.
- **Payload sanitization**: All string fields are coerced with `String()`; numeric fields use `toNumericOrNull()`. Prevents type confusion and unexpected object/array injection.
- **Body size limit**: Request bodies are limited to 512KB to reduce risk of JSON bomb / DoS.

### Error Handling

- **500 responses**: Error messages are sanitized; clients receive a generic `"Internal server error"` instead of stack traces or internal details.

### CORS

- **Preflight (OPTIONS)**: All functions handle OPTIONS and return appropriate CORS headers.
- **Credentials**: CORS allows `*` origin. The admin token is sent by the client; ensure you deploy only to trusted domains and use HTTPS.

## Database

- **Supabase client**: Uses the server-side service role key only in Netlify Functions. The key is never exposed to the client.
- **Parameterized queries**: Supabase client uses parameterized queries; no raw SQL from user input, reducing SQL injection risk.
- **Table names**: Table names are hardcoded per function; not derived from user input.

## Headers (Static Assets)

Static assets served from `dist/` include:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

API responses also include `X-Content-Type-Options: nosniff`.

## Frontend (React)

- **XSS**: React escapes output by default. No `dangerouslySetInnerHTML` or other unsafe rendering is used.
- **No `eval`**: There are no uses of `eval`, `new Function`, or similar dynamic code execution from user input.

## Deployment Recommendations

1. **Secrets**: Keep `ADMIN_TOKEN`, `VITE_ADMIN_TOKEN`, and `SUPABASE_SERVICE_ROLE_KEY` secret. Use strong, unique values and rotate periodically.
2. **Token consistency**: Use the same value for `ADMIN_TOKEN` and `VITE_ADMIN_TOKEN` so the frontend can authenticate with the API.
3. **HTTPS**: Deploy only over HTTPS (default on Netlify).
4. **Rate limiting**: Consider Netlify’s rate limiting or a CDN/WAF for additional protection against abuse.
5. **Dependencies**: Run `npm audit` and update dependencies regularly.

## Known Limitations

- **Site password**: Stored and compared client-side; can be bypassed by inspecting the bundle. Use only for light privacy, not real security.
- **Admin token in client**: `VITE_ADMIN_TOKEN` is bundled in the frontend. Anyone with access to the built assets can extract it. The app is designed for private / invite-only use (e.g., a wedding couple). For multi-user or public use, implement proper user authentication.
- **No rate limiting**: Functions do not implement rate limiting. Netlify’s platform limits apply, but consider extra measures for sensitive deployments.
- **CORS `*`**: Allows requests from any origin. To restrict, you would need to set `Access-Control-Allow-Origin` based on the request origin (e.g., your site’s domain).
