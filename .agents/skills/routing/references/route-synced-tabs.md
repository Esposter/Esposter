# Route-synced tabs — `useEnumRouteQuery`

Read when a `v-tabs` (or any enum-valued selector) should survive a refresh and be linkable — the composable, its validation and fallback, and the value `Set` each enum exposes beside it.

Sync `v-tabs` state to the URL instead of a plain `ref`, so the active tab survives a refresh and is linkable. Use `useEnumRouteQuery` (`app/composables/shared/route/useEnumRouteQuery.ts`, auto-imported) with the shared `TAB_QUERY_PARAMETER_KEY` and the enum's value `Set`.

It validates against the enum via a `transform`, falling back to the default when the param is missing **or** invalid — raw `@vueuse/router` `useRouteQuery` only falls back when the param is absent, so a hand-edited `?tab=garbage` would otherwise leave no tab active. It infers the enum type from its arguments, so no generic is needed.

```ts
import { TAB_QUERY_PARAMETER_KEY } from "@/services/route/constants";
import { FooTab, FooTabs } from "@/models/<feature>/FooTab";

// syncs to ?tab=bar and survives refresh — not a plain ref(FooTab.Bar)
const tab = useEnumRouteQuery(TAB_QUERY_PARAMETER_KEY, FooTabs, FooTab.Bar);
```

Each enum exposes a value `Set` alongside it (`FooTabs`) — `new Set(Object.values(Enum))`, typed `ReadonlySet<Enum>`. Put `useEnumRouteQuery` where the `v-tabs` `v-model` originates; when a child renders the tabs via `defineModel`, keep it in the parent and pass it down as `v-model`.
