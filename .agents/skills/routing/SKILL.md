---
name: routing
description: Esposter routing conventions — declarative links via NuxtLink/NuxtInvisibleLink or Vuetify :to (raw <a> lint-banned), navigateTo for imperative navigation (always awaited or returned — never a floating statement), useRoute() lint-banned in favour of useRouter().currentRoute (and why the ban is total, not just for reactive reads), where navigation state lives (url for what the page shows, history-entry state for how the visitor got here, localStorage for preferences — written once in a router.afterEach hook, never per link), route-synced tabs with useEnumRouteQuery, and definePageMeta validate + key for optional/nested segments — plus deep dives on why useRoute() is banned outright, the history-entry mechanics, useEnumRouteQuery, and nested-segment pages. Apply when adding links, navigating in code, reading route params/query, syncing tabs to the URL, or writing pages with dynamic or optional route segments.
---

# Routing

## Links — `NuxtLink` / `NuxtInvisibleLink` or `:to`, Never a Raw `<a>`

Declarative links use a Nuxt-native link component or a component's `:to` prop — a plain destination keeps real anchor semantics (cmd/ctrl/middle-click opens a new tab).

- Internal: `<NuxtLink :to>`, or `<NuxtInvisibleLink :to>` when the link should inherit surrounding styling.
- External: `<NuxtLink :to external target="_blank">`.
- In-page anchor: `<NuxtInvisibleLink :to="{ hash }">` (a `NuxtLink` clone that strips default link styling).
- A link-styled control with no destination is a `<span text-info underline cursor-pointer>`, not an anchor.
- Vuetify components (`v-btn`, `v-card`, `v-list-item`, `v-tab`, `v-chip`, `StyledButton`, …) with a plain destination take `:to` directly. Reserve `@click="navigateTo(...)"` for actions that run logic before navigating or compute the target at click time. Route targets still come from `RoutePath`, never string-built.

The raw-`<a>` ban is enforced by `packages/configuration/eslint/overrides/vueRules.js` via `vue/no-restricted-html-elements`. Full standard: `apps/web/content/docs/architecture/navigation.md`.

## Imperative Navigation — `navigateTo`

`navigateTo(target, options)` is the imperative form: post-mutation redirects, form submits, route guards, and dynamic-only targets with no element to hang `:to` on (search submit, `v-data-table` `@click:row`).

`router.push` is lint-enforced against (`vue/no-restricted-syntax`, same file) — use `navigateTo(target, { replace: true })`. A query-only `router.replace({ query })` is not navigation and is fine.

**Always `await` (or return) `navigateTo`** — it is async, and a floating statement-position call is a violation: the promise escapes Vue's async error handling and code after it runs before navigation settles.

- Multi-statement handler or script code → `async` function with `await navigateTo(...)`.
- Middleware → `return navigateTo(...)`.
- A **single-expression** inline handler (`@click="navigateTo(...)"`, `@click="cond && navigateTo(...)"`, one-expression arrow) is already compliant — the expression's promise is implicitly returned into Vue's `callWithAsyncErrorHandling`, which is the sanctioned "or return" form. Do not churn these into `async () => await ...`.

## Route Reads — `useRouter().currentRoute`, never `useRoute()`

**`useRoute()` is banned** (`no-restricted-syntax`), pages included. One form everywhere:

```ts
const { currentRoute } = useRouter(); // script: currentRoute.value.params.id — template: currentRoute.params.id
```

Destructured, because a ref reached through `router.` does not auto-unwrap in a template while `currentRoute` does.

- **A segment the page cannot exist without is read through `requireRouteParam(params, name)`**, never an `as string` cast: params are `string | string[] | undefined`, and a cast hands the empty case to a query that fails at the server instead of here. `getRouteParamString` stays for a genuinely optional segment.
- **Guard before spending a request** (`uuidValidateV4(id)`) where a read can race a navigation — it resolves the route after the user has left the page that named it, and the lint rule cannot see that.
- Why the ban is total rather than "reactive reads only", the `definePageMeta` callbacks that are not a `useRoute()` call, the one component test that may `mockNuxtImport("useRoute")`, and why typed routes are off: `references/route-reads.md`.

## Where Navigation State Lives — `references/navigation-state.md`

Decide by what the value **is**: part of what the page shows (a filter, a page number, a tab) → the **URL**; how the visitor got here (a breadcrumb trail, a drill-down) → the **history entry**, written in one `router.afterEach` hook and never at each link; what the visitor prefers → **`localStorage`** through the `LocalStorageKey` registry. The history-entry mechanics, and why nothing reactive may enter it, are that page.

## Route-Synced Tabs — `references/route-synced-tabs.md`

`v-tabs` state syncs to the URL through `useEnumRouteQuery(TAB_QUERY_PARAMETER_KEY, FooTabs, FooTab.Default)`, never a plain `ref`, so the active tab survives a refresh and is linkable; each enum exposes its value `Set` beside it.

## Optional / Nested Segments — `references/nested-segments.md`

One page serving optional or nested segments is keyed by the stable segment only and validates its params in `definePageMeta({ validate })`; the stable segment is read once through `requireRouteParam`, the changing one through a `computed`, and what `validate` cannot know before load is checked after it with `showError`.

## Deep Dives

- `references/route-reads.md` — when the `useRoute()` ban fires, a component test must drive the route, or typed routes look like the fix.
- `references/navigation-state.md` — when deciding where a filter, tab, trail or preference is kept, or writing into a history entry.
- `references/route-synced-tabs.md` — when a tab or enum-valued selector should survive a refresh.
- `references/nested-segments.md` — when one page component serves optional or nested segments.
