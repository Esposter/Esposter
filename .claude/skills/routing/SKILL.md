---
name: routing
description: Esposter routing conventions — links via :to/NuxtLink (raw <a> banned), navigateTo for imperative navigation, useRouter for reactive route reads, route-synced tabs with useEnumRouteQuery, and definePageMeta validate + key for optional/nested segments. Apply when adding links, navigating in code, reading route params/query, syncing tabs to the URL, or writing pages with dynamic or optional route segments.
---

# Routing

## Links — `:to` / `NuxtLink`, Never a Raw `<a>`

- Internal: `<NuxtLink :to>`, or any Vuetify component with router integration (`v-btn`, `v-card`, `v-list-item`, `v-breadcrumbs`) — see the `vuetify` skill's Navigation section for passing `:to` through wrapper props.
- External: `<NuxtLink :to external target="_blank">`.
- In-page anchor: `<NuxtInvisibleLink :to="{ hash }">` (a `NuxtLink` clone that strips default link styling).
- A link-styled control with no destination is a `<span text-info underline cursor-pointer>`, not an anchor.

A raw `<a>` is enforced by `vue/no-restricted-html-elements` (`packages/configuration/eslint/overrides/vueRules.js`); its message lists the replacement for each case. Full standard: [navigation](/docs/architecture/navigation).

## Imperative Navigation — `navigateTo`

`navigateTo(target, options)` is the imperative form: post-mutation redirects, form submits, route guards, and dynamic-only targets with no element to hang `:to` on (search submit, `v-data-table` `@click:row`).

`router.push` is lint-enforced against (`vue/no-restricted-syntax`, same file) — use `navigateTo(target, { replace: true })`. A query-only `router.replace({ query })` is not navigation and is fine.

## Reactive Route Reads — `useRouter()`, Not `useRoute()`

- **`useRouter()` for reactive reads** — route data inside a `computed`/`watch` (`router.currentRoute.value.params.id`).
- **`useRoute()` for plain reads** — params/query outside a reactive context (a page's `<script setup>`, a regular function, an async handler).

> This inverts the usual Vue Router split deliberately: `useRoute()` returns a stale, non-reactive snapshot when called outside a component setup (composables, stores, middleware, async handlers), whereas `useRouter().currentRoute` stays reactive everywhere. Route reads often live in composables, so standardizing on `useRouter()` for reactive reads avoids that footgun.

## Route-Synced Tabs — `useEnumRouteQuery`

Sync `v-tabs` state to the URL instead of a plain `ref`, so the active tab survives a refresh and is linkable. Use `useEnumRouteQuery` (`app/composables/shared/route/useEnumRouteQuery.ts`, auto-imported) with the shared `TAB_QUERY_PARAMETER_KEY` and the enum's value `Set`.

It validates against the enum via a `transform`, falling back to the default when the param is missing **or** invalid — raw `@vueuse/router` `useRouteQuery` only falls back when the param is absent, so a hand-edited `?tab=garbage` would otherwise leave no tab active. It infers the enum type from its arguments, so no generic is needed.

```typescript
import { TAB_QUERY_PARAMETER_KEY } from "#shared/services/route/constants";
import { DraftsAndSentTab, DraftsAndSentTabs } from "@/models/message/draftsAndSent/DraftsAndSentTab";

// syncs to ?tab=drafts and survives refresh — not a plain ref(DraftsAndSentTab.Drafts)
const tab = useEnumRouteQuery(TAB_QUERY_PARAMETER_KEY, DraftsAndSentTabs, DraftsAndSentTab.Drafts);
```

Each enum exposes a value `Set` alongside it (`DraftsAndSentTabs`, `ResourceBladeTypes`, `AchievementStatuses`) — `new Set(Object.values(Enum))`, typed `ReadonlySet<Enum>`. Put `useEnumRouteQuery` where the `v-tabs` `v-model` originates; when a child renders the tabs via `defineModel`, keep it in the parent and pass it down as `v-model`.

## Optional / Nested Segments — `definePageMeta` `key` + `validate`

For pages with **optional or nested route segments** sharing one page component (e.g. `[id]/[[blade]].vue`), each segment change is a different path, so by default the page **remounts** on every in-page navigation — re-running top-level `await` loaders and remounting the whole subtree (a shared sidebar/list refetches on every click).

1. **Key the page by the stable segment only**, so sibling-segment navigations reuse the page instead of remounting it.
2. **Validate params at the route boundary** — `definePageMeta({ validate })` runs on every navigation, so a bad param 404s _before_ setup. Reuse `@/services/router/validate` (uuid v4 for `id`).

```ts
// pages/resources/[id]/[[blade]].vue
import { validate } from "@/services/router/validate";

definePageMeta({
  key: (route) => `resource-${Array.isArray(route.params.id) ? route.params.id[0] : route.params.id}`,
  middleware: "auth",
  validate: (route) => validate(route) && (!route.params.blade || typeof route.params.blade === "string"),
});
const route = useRoute();
// Keyed/stable segment → plain const cast (page remounts on id change; validate guarantees it is a string)
const id = route.params.id as string;
const { load, resource } = useResource(id);
await load();
// Only the CHANGING segment needs a computed — it updates without a remount once the page is reused
const activeBlade = computed(() => (route.params.blade as string) || ResourceBladeType.Overview);
```

**Validate only what is knowable before load.** `validate` runs before setup, so it cannot see fetched data — it checks shape (uuid, `typeof x === "string"`, an enum `Set`). A segment whose valid values depend on **loaded** data must be guarded after the load instead. Because blade switches reuse the page instance, that guard is a `watchImmediate` (a one-shot setup check would not re-run on reuse), not a setup-time `if`:

```ts
// per-type blade slugs need the loaded resource's type, so validate can't cover them
watchImmediate([activeBlade, resource], ([newActiveBlade, newResource]) => {
  if (newResource && !isValidResourceBlade(newResource.type, newActiveBlade))
    showError(createError({ statusCode: 404, statusMessage: "Resource blade not found" }));
});
```

**Rules:**

- `<v-list-item :to>` / `<NuxtLink to>` are already SPA navigations — switching them to `navigateTo` does **not** fix a remount refetch. The remount comes from the per-segment page key, so fix it at the page level.
- The **keyed/stable** segment is a plain `route.params.x as string` (safe because `validate` gated it and the page remounts when it changes). Only the **changing** segment needs a `computed` — a captured `const` for it goes stale after reuse.
- `takeOne` (`@esposter/shared`) is the `noUncheckedIndexedAccess` workaround for **array / first-element** access — not for `string | string[]` route params, which `validate` + a cast already handle.
