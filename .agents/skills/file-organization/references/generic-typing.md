# Maps and components typed over a discriminant

Read when a constant map associates a discriminant key with a type-parameterised generic, when a component looks that configuration up, or when writing a component generic over a subtype.

## Generic type maps for polymorphic dispatch

Define an explicit type map first, then use a mapped type in `satisfies` for per-entry type safety without `as` casts:

```typescript
// 1. Explicit type map (one file, in models/) — one entry per discriminant value
interface FooItemTypeMap {
  [FooType.Bar]: BarFooItem;
  [FooType.Baz]: BazFooItem;
}
// 2. Satisfies a mapped type keyed by the SAME parameter the value is looked up with, so each entry
//    is checked against its own type argument — a `Record<FooType, FooConfiguration<
//    FooItemTypeMap[keyof FooItemTypeMap]>>` widens every entry to the union instead,
//    and accepts a Baz configuration filed under the Bar key
export const FooConfigurationMap = { ... } as const satisfies {
  [TFooType in FooType]: FooConfiguration<FooItemTypeMap[TFooType]>;
};
```

The uncorrelated `FooItemTypeMap[keyof FooItemTypeMap]` union is still the right thing in a **constraint** — it is the bound of what a generic parameter may be, not a claim about one key.

## Generic map lookup composables

When a component looks up a typed configuration from a generic map using a discriminant key on a generic item, extract the lookup into a composable. Use `MaybeRefOrGetter<TItem>` with `toValue()` so callers pass refs or plain values. Hide the single internal `as` cast and expose a fully typed API:

```typescript
export const useFooConfiguration = <TFooItem extends FooItemTypeMap[keyof FooItemTypeMap]>(
  item: MaybeRefOrGetter<TFooItem>,
): ComputedRef<FooConfiguration<TFooItem>> =>
  computed(() => FooConfigurationMap[toValue(item).type] as FooConfiguration<TFooItem>);
```

## Generic Vue components

Use `<script setup lang="ts" generic="T extends SomeBase">` to make a component type-safe over a subtype. Pass the typed value **and** its associated generic configuration/interface as props, so the parent resolves the concrete types and the child stays typed without lookups or casts:

```vue
<!-- Parent (knows concrete type): -->
<FooPicker :item="modelValue" :configuration="FooConfigurationMap[FooType.Bar]" />
<!-- Child: -->
<script setup lang="ts" generic="TFooItem extends FooItemTypeMap[keyof FooItemTypeMap]">
interface Props {
  configuration: FooConfiguration<TFooItem>;
  item: TFooItem;
}
</script>
```
