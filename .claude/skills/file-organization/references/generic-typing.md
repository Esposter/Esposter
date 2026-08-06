# Maps and components typed over a discriminant

Read when a constant map associates a discriminant key with a type-parameterised generic, when a component looks that configuration up, or when writing a component generic over a subtype.

## Generic type maps for polymorphic dispatch

Define an explicit type map first, then use a mapped type in `satisfies` for per-entry type safety without `as` casts:

```typescript
// 1. Explicit type map (one file, in models/)
type DataSourceItemTypeMap = { [DataSourceType.Csv]: CsvDataSourceItem };
// 2. Satisfies mapped type — each entry checked against its specific type parameter
export const DataSourceConfigurationMap: Record<
  DataSourceType,
  DataSourceConfiguration<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>
> = { ... };
```

## Generic map lookup composables

When a component looks up a typed configuration from a generic map using a discriminant key on a generic item, extract the lookup into a composable. Use `MaybeRefOrGetter<TItem>` with `toValue()` so callers pass refs or plain values. Hide the single internal `as` cast and expose a fully typed API:

```typescript
export const useDataSourceConfiguration = <TDataSourceItem extends DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>(
  item: MaybeRefOrGetter<TDataSourceItem>,
): ComputedRef<DataSourceConfiguration<TDataSourceItem>> =>
  computed(() => DataSourceConfigurationMap[toValue(item).type] as DataSourceConfiguration<TDataSourceItem>);
```

## Generic Vue components

Use `<script setup lang="ts" generic="T extends SomeBase">` to make a component type-safe over a subtype. Pass the typed value **and** its associated generic configuration/interface as props, so the parent resolves the concrete types and the child stays typed without lookups or casts:

```vue
<!-- Parent (knows concrete type): -->
<FilePicker :item="modelValue" :configuration="DataSourceConfigurationMap[DataSourceType.Csv]" />
<!-- Child: -->
<script setup lang="ts" generic="TDataSourceItem extends DataSourceItemTypeMap[keyof DataSourceItemTypeMap]">
interface FilePickerProps {
  configuration: DataSourceConfiguration<TDataSourceItem>;
  item: TDataSourceItem;
}
</script>
```
