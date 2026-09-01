# Rendering a Date or Time in a `.vue`

Read when rendering a date or time in a `.vue` file.

Every rendered date is a `<NuxtTime>`, except in the message list — the one exception, described below. The ban itself is lint-enforced (`vue/no-restricted-syntax` and `vue/no-restricted-html-elements` in `packages/configuration/eslint/overrides/vueRules.js`), and the full standard is `packages/app/content/docs/architecture/date-time-display.md`.

The component formats after the prehydrate rewrite, in the reader's locale and timezone, so the server's UTC clock never leaks into the page and the text cannot mismatch on hydration.

## Three things the lint rule cannot tell you

- **Options, not format strings** — `Intl.DateTimeFormat` attributes (`weekday`, `month`, `hour`, …), `relative` for time-ago. A format used more than once is one attributes constant, spread with `:="…"`. Bare `title` is not a localized tooltip — it renders `toISOString()` and the prehydrate script never rewrites it, so it shows UTC machine text; pass a string or leave it off.
- **A component can't live in a prop string** — a subtitle or sentence that embeds a time becomes slot content with the time in inline flow, never a template literal in script.
- **`relative` ticks per instance, once a second** — fine for a notification list, worth a thought before a long feed of them.

## What is still a format string

`formatDate` owns date _data_ (filenames, CSV, table-sort accessors, the value an input writes back), `parseDate` reads it back, and services/server code format freely — the rule is `.vue`-only. Date _logic_ is Temporal, through `@esposter/shared`'s day helpers.

## The one display exception

The **message list**: its `Today`/`Yesterday` labels and 24-hour gutter clock branch on the reader's own day boundary, which no single `<NuxtTime>` expresses, so they stay `getMessageDateLabel`/`getShortTimeLabel` in `app/util/date/`.

It is safe only because `/messages/**` is client-rendered (`configuration/routeRules.ts`) — there is no server render to disagree with, and the labels format in the reader's locale and timezone because the browser is the only thing that formats them. Outside a `ssr: false` route the exception does not exist.
