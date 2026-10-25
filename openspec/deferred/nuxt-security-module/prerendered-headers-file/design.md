# Prerendered headers file

A static host serves a prerendered page without the app's server, so the headers the module sets on a rendered page never reach it. A headers file, which the host reads beside its build output, would carry them instead.

## Why deferred

The app does not ship a static build. Its routes render on the server, and the routes that skip server rendering are client-only, so no prerendered page reaches a static host (`apps/web/configuration/routeRules.ts`). A headers file would therefore describe pages nothing serves. The options that announced it were dead configuration, so the package removed them in the same change rather than leave a switch that changes nothing.

## Revisit when

The app ships a prerendered page to a host that reads a headers file and cannot set headers on the response. Until then the work is owed to no page a visitor reaches.

## Cheaper interim

The host's own header configuration sets the same values. The module's values, and the sources each one rests on, are in `openspec/specs/nuxt-security-module/defaults-review/design.md`.
