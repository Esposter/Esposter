// The one compatibility date: Nuxt's, the app Worker's, and the date `apps/jobs` and `apps/realtime` restate in their
// `wrangler.jsonc`, which cannot import it. It moves with the score review, never past the installed workerd's own date
// @TODO: https://github.com/unjs/env-runner/pull/114 — needed once this date passes 2026-11-17: past it, the dev
// Runner's module fallback cannot load the entry of miniflare 5, the Workers runtime the dev server runs on
export const compatibilityDate = "2026-11-16";
