---
name: routing
description: Apply when adding links, navigating in code, reading route params/query, syncing tabs to the URL, or writing pages with dynamic or optional route segments. Esposter routing conventions — declarative links via NuxtLink/NuxtInvisibleLink or a library component's :to, navigateTo awaited or returned for imperative navigation, useRouter().currentRoute in place of the banned useRoute(), where navigation state lives (url, history entry, localStorage), route-synced tabs with useEnumRouteQuery, and definePageMeta validate + key for optional or nested segments.
---

# Routing

## Links — `NuxtLink` / `NuxtInvisibleLink` or `:to`, Never a Raw `<a>`

A link is `NuxtLink`, `NuxtInvisibleLink` or a library component's `:to`, never a raw `<a>` (`vue/no-restricted-html-elements`), with its target from `RoutePath` (`references/links.md`).

## Imperative Navigation — `navigateTo`

`navigateTo(target, options)`, always awaited or returned — never `router.push` (`vue/no-restricted-syntax`); a single-expression inline handler already returns it (`references/navigate-to.md`).

## Route Reads — `useRouter().currentRoute`, never `useRoute()`

**`useRoute()` is banned** (`no-restricted-syntax`), pages included. One form everywhere:

```ts
const { currentRoute } = useRouter(); // script: currentRoute.value.params.id — template: currentRoute.params.id
```

Destructured, because a ref reached through `router.` does not auto-unwrap in a template while `currentRoute` does.

- **A segment the page cannot exist without is read through `requireRouteParam(params, name)`**, never an `as string` cast: params are `string | string[] | undefined`, and a cast hands the empty case to a query that fails at the server instead of here. `getRouteParamString` stays for a genuinely optional segment.
- **Guard before spending a request** (`checkIsUuidV4(id)`) where a read can race a navigation — it resolves the route after the user has left the page that named it, and the lint rule cannot see that.
- Why the ban is total rather than "reactive reads only", the `definePageMeta` callbacks that are not a `useRoute()` call, the one component test that may `mockNuxtImport("useRoute")`, and why typed routes are off: `references/route-reads.md`.

## Where Navigation State Lives — `references/navigation-state.md`

Decide by what the value **is**: part of what the page shows (a filter, a page number, a tab) → the **URL**; how the visitor got here (a breadcrumb trail, a drill-down) → the **history entry**, written in one `router.afterEach` hook and never at each link; what the visitor prefers → **`localStorage`** through the `LocalStorageKey` registry. The history-entry mechanics, and why nothing reactive may enter it, are that page.

## Route-Synced Tabs — `references/route-synced-tabs.md`

`UiTabs` state syncs to the URL through `useEnumRouteQuery(TAB_QUERY_PARAMETER_KEY, FooTabs, FooTab.Default)`, never a plain `ref`, so the active tab survives a refresh and is linkable; each enum exposes its value `Set` beside it.

## Optional / Nested Segments — `references/nested-segments.md`

One page serving optional or nested segments is keyed by the stable segment only and validates its params in `definePageMeta({ validate })`; the stable segment is read once through `requireRouteParam`, the changing one through a `computed`, and what `validate` cannot know before load is checked after it with `showError`.

## Deep Dives

- `references/route-reads.md` — when the `useRoute()` ban fires, a component test must drive the route, or typed routes look like the fix.
- `references/navigation-state.md` — when deciding where a filter, tab, trail or preference is kept, or writing into a history entry.
- `references/route-synced-tabs.md` — when a tab or enum-valued selector should survive a refresh.
- `references/nested-segments.md` — when one page component serves optional or nested segments.
- `references/links.md` — when adding a link or a control that goes somewhere.
- `references/navigate-to.md` — when code navigates imperatively.
