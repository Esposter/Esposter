# Codebase Audit

Audit for permanent security and performance fixes. No workarounds (no pinned deps, no TODOs, no "consider upgrading").

## Scope

Read these files fully:

- `packages/app/nuxt.config.ts`
- `packages/app/configuration/security.ts`
- `packages/app/configuration/nitro.ts`
- `packages/app/configuration/vite.ts`
- `packages/app/configuration/pwa.ts`
- `packages/app/server/middleware/` (all files)
- `packages/app/server/trpc/context.ts` + middleware
- `packages/app/server/db/index.ts`
- `packages/azure-functions/host.json`
- Any `v-html` usage across Vue components

## Security Checks

- CSP: flag `unsafe-eval`, `unsafe-inline`, overly broad origins; suggest nonce/hash alternatives
- Headers: verify `X-Content-Type-Options`, `X-Frame-Options`, `HSTS`, `Referrer-Policy` are set
- `v-html`: flag any instance where content comes from user input without prior sanitization — note: message HTML is sanitized in `useDataStore.createMessage` / `updateMessage` via `sanitizeMessageHtml`, so `useMessageWithMentions` output is safe
- Auth: check tRPC procedures and server routes for missing auth guards
- Secrets: flag any env vars read client-side or logged
- Rate limiting: verify all mutation endpoints (tRPC + HTTP) are covered
- CORS: check Nitro CORS config is explicit, not wildcard

## Performance Checks

- Route rules: static assets should have long `maxAge`; API routes `maxAge: 0`
- Vite `assetsInlineLimit`: flag if `0` affects non-Phaser assets
- Console logs in server code: flag any `console.log` not behind `isDev` guard
- Bundle: note any large sync imports that could be lazy-loaded (GrapesJS, heavy editors)
- DB queries: flag any hot path without caching for stable data (user profiles, room metadata)

## Output Format

Group by **Security** / **Performance** / **Config**. For each finding:

```text
[SEVERITY] File:line — problem — exact fix
```

Severities: CRITICAL / HIGH / MEDIUM / LOW

Skip anything already correctly implemented. No praise, no summaries — findings only.
