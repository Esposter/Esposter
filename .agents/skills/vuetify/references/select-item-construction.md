# Constructing a select / list items array

Read when building the items constant for a `v-select`, `v-autocomplete`, `v-list` or menu. The rules — typed `SelectItemCategoryDefinition<T>[]`, no `item-title`/`item-value`, `clearable` banned, enum values as titles — are in `SKILL.md`.

Pick the construction by what each item carries:

| Shape                                     | Construction                                                                      | Canonical example                             |
| ----------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------- |
| Enum value as title + extra fields (icon) | `as const satisfies Record<Enum, …>` map + `parseDictionaryToArray(Map, "value")` | `DataSourceTypeItemCategoryDefinitions`       |
| Custom titles / an empty-sentinel item    | plain `SelectItemCategoryDefinition<T>[]` array literal                           | `BooleanFilterValueItemCategoryDefinitions`   |
| Enum value needing display formatting     | `Object.values(Enum).map(...)` through `prettify()`                               | `StringTransformationItemCategoryDefinitions` |

Source data whose field names differ is mapped at the call site so no extra props are needed:

```typescript
// CORRECT — map to SelectItemCategoryDefinition<T> so no item-title/item-value needed
const categoryItems = computed<SelectItemCategoryDefinition<string>[]>(() => [
  { title: "None", value: "" },
  ...categories.value.map(({ id, name }) => ({ title: name, value: id })),
]);
// <v-select :items="categoryItems" />
```
