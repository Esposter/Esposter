# Optional and nested route segments — `definePageMeta` `key` + `validate`

Read when one page component serves optional or nested segments (`[id]/[[bar]].vue`): keying by the stable segment, validating at the route boundary, what `validate` cannot see, and which segment is read once versus computed.

For pages with **optional or nested route segments** sharing one page component (e.g. `[id]/[[bar]].vue`), each segment change is a different path, so by default the page **remounts** on every in-page navigation — re-running top-level `await` loaders and remounting the whole subtree (a shared sidebar/list refetches on every click).

1. **Key the page by the stable segment only**, so sibling-segment navigations reuse the page instead of remounting it.
2. **Validate params at the route boundary** — `definePageMeta({ validate })` runs on every navigation, so a bad param 404s _before_ setup. Reuse `@/services/router/checkIsUuidRouteId` (uuid v4 for `id`).

```ts
// pages/foos/[id]/[[bar]].vue
import { checkIsUuidRouteId } from "@/services/router/checkIsUuidRouteId";
import { getRouteParam } from "@/util/router/getRouteParam";

definePageMeta({
  key: (route) => `foo-${getRouteParam(route.params, "id")}`,
  middleware: "auth",
  validate: checkIsUuidRouteId,
});
// The page's own route, narrowed to its params by the typed router
const route = useRoute();
// Keyed/stable segment → read once (the page remounts on id change)
const { id } = route.params;
const { foo, load } = useFoo(id);
await load();
// Only the CHANGING segment needs a computed — it updates without a remount once the page is reused
const activeBar = computed(() => route.params.bar || FooBarType.Default);
```

**Validate only what is knowable before load.** `validate` runs before setup, so it cannot see fetched data — it checks shape (a uuid, an enum `Set`). A segment whose valid values depend on **loaded** data must be guarded after the load instead. Because sibling-segment switches reuse the page instance, that guard is a `watchImmediate` (a one-shot setup check would not re-run on reuse), not a setup-time `if`:

```ts
// composables/foo/useValidateFooBar.ts — per-type bar slugs need the loaded foo's type, so validate can't cover them
export const useValidateFooBar = (foo: Ref<Foo | undefined>, activeBar: Ref<string>) => {
  const { currentRoute } = useRouter();
  watchImmediate([activeBar, foo], ([newActiveBar, newFoo]) => {
    if (!newFoo || newFoo.id !== getRouteParam(currentRoute.value.params, "id")) return;

    if (!isValidFooBar(newFoo.type, newActiveBar))
      showError(createError({ statusCode: 404, statusMessage: "Foo bar not found" }));
  });
};
// pages/foos/[id]/[[bar]].vue
useValidateFooBar(foo, activeBar);
```

The guard is a composable the page calls rather than code in the page, because it reads the live route: a page reads only its own `useRoute()` and may not call `useRouter()`.

**Judge the segment only while the route still names the loaded entity.** A swap to another id keeps the page being left mounted until the next one's setup resolves, and `currentRoute` already carries the next id's segment — checked against the entity still loaded, a segment only the next one's type has 404s the page on its way out (`apps/web/app/composables/resource/useValidateResourceBlade.ts`).

**Rules:**

- A list row's `@click="navigateTo(...)"` / a `<NuxtLink to>` are already SPA navigations — they do **not** cause (or fix) a remount refetch. The remount comes from the per-segment page key, so fix it at the page level.
- The **keyed/stable** segment is read once off the page's `useRoute()` — the page remounts when it changes, so a captured `const` stays correct. Only the **changing** segment needs a `computed`, since a captured `const` for it goes stale once the page is reused.
- `takeOne` (`@esposter/shared`) is the `noUncheckedIndexedAccess` workaround for **array / first-element** access — not for `string | string[]` route params, which the typed route and `getRouteParam` already resolve.
