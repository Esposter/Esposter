---
name: routing
description: Esposter routing conventions — declarative links via NuxtLink/NuxtInvisibleLink or Vuetify :to (raw <a> lint-banned), navigateTo for imperative navigation (always awaited or returned — never a floating statement), useRoute() lint-banned in favour of useRouter().currentRoute (and why the ban is total, not just for reactive reads), where navigation state lives (url for what the page shows, history-entry state for how the visitor got here, localStorage for preferences — written once in a router.afterEach hook, never per link), route-synced tabs with useEnumRouteQuery, and definePageMeta validate + key for optional/nested segments. Apply when adding links, navigating in code, reading route params/query, syncing tabs to the URL, or writing pages with dynamic or optional route segments.
---

# Routing

## Links — `NuxtLink` / `NuxtInvisibleLink` or `:to`, Never a Raw `<a>`

Declarative links use a Nuxt-native link component or a component's `:to` prop — a plain destination keeps real anchor semantics (cmd/ctrl/middle-click opens a new tab).

- Internal: `<NuxtLink :to>`, or `<NuxtInvisibleLink :to>` when the link should inherit surrounding styling.
- External: `<NuxtLink :to external target="_blank">`.
- In-page anchor: `<NuxtInvisibleLink :to="{ hash }">` (a `NuxtLink` clone that strips default link styling).
- A link-styled control with no destination is a `<span text-info underline cursor-pointer>`, not an anchor.
- Vuetify components (`v-btn`, `v-card`, `v-list-item`, `v-tab`, `v-chip`, `StyledButton`, …) with a plain destination take `:to` directly. Reserve `@click="navigateTo(...)"` for actions that run logic before navigating or compute the target at click time. Route targets still come from `RoutePath`, never string-built.

The raw-`<a>` ban is enforced by `packages/configuration/eslint/overrides/vueRules.js` via `vue/no-restricted-html-elements`. Full standard: [navigation](/docs/architecture/navigation).

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

The message states the fix; what it can't say is why the ban is total rather than "reactive reads only". `useRoute()` resolves through the page's _injected_ route, which is pinned to that page instance and freezes to its last value once the page is swapped out. Anything outliving the page that created it — a Pinia store above all, cached for the app's lifetime — then answers for a route the user has already left, and a route naming no segment yields the `""` sentinel that reaches the server as a uuid and is rejected.

- **A segment the page cannot exist without is read through `requireRouteParam(params, name)`**, never an `as string` cast: params are `string | string[] | undefined`, and a cast hands the empty case to a query that fails at the server instead of here. `getRouteParamString` stays for a genuinely optional segment.
- **Guard before spending a request** (`uuidValidateV4(id)`) where a read can race a navigation — it resolves the route after the user has left the page that named it, and the lint rule cannot see that.
- A `definePageMeta` `validate`/`key` callback receives its own `route` argument. That is not a `useRoute()` call and none of the above applies to it.
- Tests do not catch the staleness on their own — with no page component in the tree there is no injection to pin, so both forms are the same object there and both pass.
- **The one earned exception is a component test that must drive the route.** `mockNuxtImport("useRoute")` is supported; `mockNuxtImport("useRouter")` replaces the router Nuxt's own plugins call (`router.beforeResolve`) and takes the whole environment down. A component that reads the route _only_ to render, holds nothing past its page, and needs that mock takes an `eslint-disable-next-line` carrying this reason.
- Typed routes do not help and are deliberately off. Both `experimental.typedPages` and `nuxt-typed-router` type `params` as a union across every route, narrowed only by naming the route at the call site — and the generic readers (`validate`, the `use*FromRoute` composables) run under several routes, so for them the union is the correct type and no narrowing exists.

## Where Navigation State Lives — URL vs History Entry vs Storage

Decide by what the value **is**, not by what is reachable:

- **Part of what the page shows** (filter, page number, tab) → the **URL**, so a share, a bookmark and a refresh all show the same thing (`useEnumRouteQuery` below).
- **How the visitor got here** (a breadcrumb trail, whether this was a drill-down) → the **history entry**, read back from `window.history.state` and written by merging into it — spread the current state, or the write erases whatever the router keeps there:

  ```typescript
  window.history.replaceState({ ...window.history.state, trail }, "");
  ```

  Its lifetime already matches: per entry, kept across a reload, restored on back/forward, gone with the entry.

  **Everything in that object is structured-cloned, so none of it may be reactive state.** A `ref`'s array or a
  store's object reaches the serializer as a Proxy, which it rejects outright — and the `DataCloneError` is thrown
  inside the `afterEach` hook, so it rejects the navigation that was being recorded rather than merely losing the
  value. Hand the entry a plain snapshot, and make that the returned contract of the pure function above rather
  than a spread at the call site.

- **What the visitor prefers** (a collapsed rail, a theme) → **`localStorage`** through the `LocalStorageKey` registry — it outlives the tab and belongs to the person.

The middle case is the one that gets mis-filed. Putting "how I got here" in the URL mints a second address for one page (worse for sharing, bookmarks and analytics, and editable by anyone who types); putting it in storage makes it outlive the journey, so a tab restored later claims a path nobody walked.

**Write that state in one place — a `router.afterEach` hook in a client plugin — never at each link.** A value appended by hand at N call sites is one the N+1th link silently drops, and the page that lost it is indistinguishable from a page that never had it. Keep the rules as a pure function so they are testable without a browser, and validate anything read back off an entry (it may predate the release). Worked example: `/docs/platform/breadcrumb-trail`.

## Route-Synced Tabs — `useEnumRouteQuery`

Sync `v-tabs` state to the URL instead of a plain `ref`, so the active tab survives a refresh and is linkable. Use `useEnumRouteQuery` (`app/composables/shared/route/useEnumRouteQuery.ts`, auto-imported) with the shared `TAB_QUERY_PARAMETER_KEY` and the enum's value `Set`.

It validates against the enum via a `transform`, falling back to the default when the param is missing **or** invalid — raw `@vueuse/router` `useRouteQuery` only falls back when the param is absent, so a hand-edited `?tab=garbage` would otherwise leave no tab active. It infers the enum type from its arguments, so no generic is needed.

```typescript
import { TAB_QUERY_PARAMETER_KEY } from "@/services/route/constants";
import { FooTab, FooTabs } from "@/models/<feature>/FooTab";

// syncs to ?tab=bar and survives refresh — not a plain ref(FooTab.Bar)
const tab = useEnumRouteQuery(TAB_QUERY_PARAMETER_KEY, FooTabs, FooTab.Bar);
```

Each enum exposes a value `Set` alongside it (`FooTabs`) — `new Set(Object.values(Enum))`, typed `ReadonlySet<Enum>`. Put `useEnumRouteQuery` where the `v-tabs` `v-model` originates; when a child renders the tabs via `defineModel`, keep it in the parent and pass it down as `v-model`.

## Optional / Nested Segments — `definePageMeta` `key` + `validate`

For pages with **optional or nested route segments** sharing one page component (e.g. `[id]/[[bar]].vue`), each segment change is a different path, so by default the page **remounts** on every in-page navigation — re-running top-level `await` loaders and remounting the whole subtree (a shared sidebar/list refetches on every click).

1. **Key the page by the stable segment only**, so sibling-segment navigations reuse the page instead of remounting it.
2. **Validate params at the route boundary** — `definePageMeta({ validate })` runs on every navigation, so a bad param 404s _before_ setup. Reuse `@/services/router/validate` (uuid v4 for `id`).

```ts
// pages/foos/[id]/[[bar]].vue
import { validate } from "@/services/router/validate";
import { getRouteParamString } from "@/util/router/getRouteParamString";
import { requireRouteParam } from "@/util/router/requireRouteParam";

definePageMeta({
  key: (route) => `foo-${Array.isArray(route.params.id) ? route.params.id[0] : route.params.id}`,
  middleware: "auth",
  validate: (route) => validate(route) && (!route.params.bar || typeof route.params.bar === "string"),
});
const { currentRoute } = useRouter();
// Keyed/stable segment → read once (the page remounts on id change), through the throwing helper
const id = requireRouteParam(currentRoute.value.params, "id");
const { foo, load } = useFoo(id);
await load();
// Only the CHANGING segment needs a computed — it updates without a remount once the page is reused
const activeBar = computed(() => getRouteParamString(currentRoute.value.params.bar) || FooBarType.Default);
```

**Validate only what is knowable before load.** `validate` runs before setup, so it cannot see fetched data — it checks shape (uuid, `typeof x === "string"`, an enum `Set`). A segment whose valid values depend on **loaded** data must be guarded after the load instead. Because sibling-segment switches reuse the page instance, that guard is a `watchImmediate` (a one-shot setup check would not re-run on reuse), not a setup-time `if`:

```ts
// per-type bar slugs need the loaded foo's type, so validate can't cover them
watchImmediate([activeBar, foo], ([newActiveBar, newFoo]) => {
  if (newFoo && !isValidFooBar(newFoo.type, newActiveBar))
    showError(createError({ statusCode: 404, statusMessage: "Foo bar not found" }));
});
```

**Rules:**

- A `v-list-item` `@click="navigateTo(...)"` / a `<NuxtLink to>` are already SPA navigations — they do **not** cause (or fix) a remount refetch. The remount comes from the per-segment page key, so fix it at the page level.
- The **keyed/stable** segment is read once through `requireRouteParam` — the page remounts when it changes, so a captured `const` stays correct. Only the **changing** segment needs a `computed`, since a captured `const` for it goes stale once the page is reused.
- `takeOne` (`@esposter/shared`) is the `noUncheckedIndexedAccess` workaround for **array / first-element** access — not for `string | string[]` route params, which `requireRouteParam` / `getRouteParamString` already normalize.
