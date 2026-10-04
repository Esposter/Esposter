---
name: routing
description: Apply when adding links, navigating in code, reading route params/query, syncing tabs to the URL, or writing pages with dynamic or optional route segments. Esposter's routing — declarative links over a raw <a>, navigateTo awaited or returned, useRouter().currentRoute in place of the banned useRoute(), navigation state kept in the URL, the history entry or localStorage by what it is, and optional segments keyed and validated in definePageMeta.
---

# Routing

## Links — `NuxtLink` / `NuxtInvisibleLink` or `:to`, Never a Raw `<a>`

A link is `NuxtLink`, `NuxtInvisibleLink` or a library component's `:to`, never a raw `<a>` (`vue/no-restricted-html-elements`), with its target from `RoutePath` (`references/links.md`). A route is `RoutePath`'s wherever it is written, a test's address or a template string as much as a link, so a rename moves every reader; `routing/no-route-literal` (`scripts/src/oxlint/routing.ts`) reports a string spelling one of its paths, read off `RoutePath` itself.

## Imperative Navigation — `navigateTo`

`navigateTo(target, options)`, always awaited or returned — never `router.push` (`vue/no-restricted-syntax`); a single-expression inline handler already returns it (`references/navigate-to.md`).

## Route Reads — `useRouter().currentRoute`, never `useRoute()`

**`useRoute()` is banned** (`no-restricted-syntax`), pages included. One form everywhere:

```ts
// script: currentRoute.value.params.id — template: currentRoute.params.id
const { currentRoute } = useRouter();
```

Destructured, because a ref reached through `router.` does not auto-unwrap in a template while `currentRoute` does.

- **A segment is read by name — `getRouteParam(params, name)`, or `requireRouteParam(params, name)` for one the page cannot exist without** — never a property access or an `as string` cast. Params read without naming the route are the union of every page's, so a property access does not typecheck, and the name is checked against the route map instead. `requireRouteParam` throws where `getRouteParam` answers `""`, because a cast hands the empty case to a query that fails at the server instead of here. A query value goes through `getRouteParamString`.
- **Guard before spending a request** (`checkIsUuidV4(id)`) where a read can race a navigation — it resolves the route after the user has left the page that named it, and the lint rule cannot see that.
- Why the ban is total rather than "reactive reads only", the `definePageMeta` callbacks that are not a `useRoute()` call, the one component test that may `mockNuxtImport("useRoute")`, and why a page's typed `useRoute()` does not lift the ban: `references/route-reads.md`.

## Where Navigation State Lives — `references/navigation-state.md`

Decide by what the value **is**: part of what the page shows (a filter, a page number, a tab) → the **URL**; how the visitor got here (a breadcrumb trail, a drill-down) → the **history entry**, written in one `router.afterEach` hook and never at each link; what the visitor prefers → **`localStorage`** through the `LocalStorageKey` registry. The history-entry mechanics, and why nothing reactive may enter it, are that page.

## Route-Synced Tabs — `references/route-synced-tabs.md`

`UiTabs` state syncs to the URL through `useEnumRouteQuery(TAB_QUERY_PARAMETER_KEY, FooTabs, FooTab.Default)`, never a plain `ref`, so the active tab survives a refresh and is linkable; each enum exposes its value `Set` beside it.

## Optional / Nested Segments — `references/nested-segments.md`

One page serving optional or nested segments is keyed by the stable segment only and validates its params in `definePageMeta({ validate })`; the stable segment is read once through `requireRouteParam`, the changing one through a `computed`, and what `validate` cannot know before load is checked after it with `showError`.

## Static Paths — Never a Page's

A file in `public/` or a Nitro `publicAssets` mount never sits at a path a page answers: the server serves the static path first, so the page works when linked to and breaks on a reload (a directory redirects to its trailing-slash form, which no page matches). Mount asset data under a prefix no page uses, as `data/<feature>/` does; `configuration/nitro.test.ts` resolves every static path through the router and fails on a match.

## Deep Dives

- `references/route-reads.md` — when the `useRoute()` ban fires, a component test must drive the route, or a page's typed `useRoute()` looks like a reason to lift the ban.
- `references/navigation-state.md` — when deciding where a filter, tab, trail or preference is kept, or writing into a history entry.
- `references/route-synced-tabs.md` — when a tab or enum-valued selector should survive a refresh.
- `references/nested-segments.md` — when one page component serves optional or nested segments.
- `references/links.md` — when adding a link or a control that goes somewhere.
- `references/navigate-to.md` — when code navigates imperatively.
