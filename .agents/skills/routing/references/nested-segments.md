# Optional and nested route segments — `definePageMeta` `key` + `validate`

Read when one page component serves optional or nested segments (`[id]/[[bar]].vue`): keying by the stable segment, validating at the route boundary, what `validate` cannot see, and which segment is read once versus computed.

For pages with **optional or nested route segments** sharing one page component (e.g. `[id]/[[bar]].vue`), each segment change is a different path, so by default the page **remounts** on every in-page navigation — re-running top-level `await` loaders and remounting the whole subtree (a shared sidebar/list refetches on every click).

1. **Key the page by the stable segment only**, so sibling-segment navigations reuse the page instead of remounting it.
2. **Validate params at the route boundary** — `definePageMeta({ validate })` runs on every navigation, so a bad param 404s _before_ setup. Reuse `@/services/router/checkIsUuidRouteId` (uuid v4 for `id`).

```ts
// pages/foos/[id]/[[bar]].vue
import { checkIsUuidRouteId } from "@/services/router/checkIsUuidRouteId";
import { getRouteParamString } from "@/util/router/getRouteParamString";
import { requireRouteParam } from "@/util/router/requireRouteParam";

definePageMeta({
  key: (route) => `foo-${Array.isArray(route.params.id) ? route.params.id[0] : route.params.id}`,
  middleware: "auth",
  validate: (route) => checkIsUuidRouteId(route) && (!route.params.bar || typeof route.params.bar === "string"),
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

- A list row's `@click="navigateTo(...)"` / a `<NuxtLink to>` are already SPA navigations — they do **not** cause (or fix) a remount refetch. The remount comes from the per-segment page key, so fix it at the page level.
- The **keyed/stable** segment is read once through `requireRouteParam` — the page remounts when it changes, so a captured `const` stays correct. Only the **changing** segment needs a `computed`, since a captured `const` for it goes stale once the page is reused.
- `takeOne` (`@esposter/shared`) is the `noUncheckedIndexedAccess` workaround for **array / first-element** access — not for `string | string[]` route params, which `requireRouteParam` / `getRouteParamString` already normalize.
