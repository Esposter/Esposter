---
name: routing
description: Apply when adding links, navigating in code, reading route params/query, syncing tabs to the URL, or writing pages with dynamic or optional route segments. Esposter's routing — declarative links over a raw <a>, navigateTo awaited or returned, a page's own typed useRoute() and useRouter().currentRoute everywhere else, navigation state kept in the URL, the history entry or localStorage by what it is, and optional segments keyed and validated in definePageMeta.
---

# Routing

## Links — `NuxtLink` / `NuxtInvisibleLink` or `:to`, Never a Raw `<a>`

A link is `NuxtLink`, `NuxtInvisibleLink` or a library component's `:to`, never a raw `<a>` (`vue/no-restricted-html-elements`), with its target from `RoutePath` (`references/links.md`). A route is `RoutePath`'s wherever it is written, a test's address or a template string as much as a link, so a rename moves every reader; `routing/no-route-literal` (`scripts/src/oxlint/routing.ts`) reports a string spelling one of its paths, read off `RoutePath` itself.

## Imperative Navigation — `navigateTo`

`navigateTo(target, options)`, always awaited or returned — never `router.push` (`vue/no-restricted-syntax`); a single-expression inline handler already returns it (`references/navigate-to.md`).

## Route Reads — a Page's Own `useRoute()`, `useRouter().currentRoute` Everywhere Else

**A page reads its own segments through `useRoute()`** — the one place the call is allowed, and a page's only route read: the `apps/web/app/pages/**/*.vue` override of `no-restricted-globals` lifts the `useRoute` ban and bans `useRouter` there instead, since a page navigates with `navigateTo`. The typed router narrows a page's no-argument `useRoute()` to that page's params, so `route.params.id` is a `string` with no helper and no cast:

```ts
const route = useRoute();
const { id } = route.params;
```

**Everywhere else `useRoute()` is banned** — a component, composable or store reads `useRouter().currentRoute`, destructured, because a ref reached through `router.` does not auto-unwrap in a template while `currentRoute` does.

- **Outside a page, a segment is read by name — `getRouteParam(params, name)`** — never a property access or an `as string` cast. Params read without naming the route are the union of every page's, so a property access does not typecheck, and the name is checked against the route map instead; a route without the segment answers `""`. A `definePageMeta` callback's `route` is that union too, so it takes `getRouteParam`. The room a message surface reads for is the room store's `currentRoomId`, never a fresh route read. A query value goes through `getRouteParamString`.
- **A page hands its segment down** rather than a composable re-reading the route: `useReadUser(route.params.id)`, never a `*FromRoute` composable.
- **Guard before spending a request** (`checkIsUuidV4(id)`) where a read can race a navigation — it resolves the route after the user has left the page that named it, and the lint rule cannot see that.
- Why the ban holds outside pages, the `definePageMeta` callbacks that are not a `useRoute()` call, and the one component test that may `mockNuxtImport("useRoute")`: `references/route-reads.md`.

## Where Navigation State Lives — `references/navigation-state.md`

Decide by what the value **is**: part of what the page shows (a filter, a page number, a tab) → the **URL**; how the visitor got here (a breadcrumb trail, a drill-down) → the **history entry**, written in one `router.afterEach` hook and never at each link; what the visitor prefers → **`localStorage`** through the `LocalStorageKey` registry. The history-entry mechanics, and why nothing reactive may enter it, are that page.

## Route-Synced Tabs — `references/route-synced-tabs.md`

`UiTabs` state syncs to the URL through `useEnumRouteQuery(TAB_QUERY_PARAMETER_KEY, FooTabs, FooTab.Default)`, never a plain `ref`, so the active tab survives a refresh and is linkable; each enum exposes its value `Set` beside it.

## Optional / Nested Segments — `references/nested-segments.md`

One page serving optional or nested segments is keyed by the stable segment only and validates its params in `definePageMeta({ validate })`; the stable segment is read once off the page's `useRoute()`, the changing one through a `computed`, and what `validate` cannot know before load is checked after it with `showError`.

## Static Paths — Never a Page's

A file in `public/` or a Nitro `publicAssets` mount never sits at a path a page answers: the server serves the static path first, so the page works when linked to and breaks on a reload (a directory redirects to its trailing-slash form, which no page matches). Mount asset data under a prefix no page uses, as `data/<feature>/` does; `configuration/nitro.test.ts` resolves every static path through the router and fails on a match.

## Deep Dives

- `references/route-reads.md` — when the `useRoute()` ban fires outside a page, or a component test must drive the route.
- `references/navigation-state.md` — when deciding where a filter, tab, trail or preference is kept, or writing into a history entry.
- `references/route-synced-tabs.md` — when a tab or enum-valued selector should survive a refresh.
- `references/nested-segments.md` — when one page component serves optional or nested segments.
- `references/links.md` — when adding a link or a control that goes somewhere.
- `references/navigate-to.md` — when code navigates imperatively.
