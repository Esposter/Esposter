# When a value earns a `computed`

Use count is not the test. A `computed` is a cache with a price: a `ComputedRefImpl` allocation, a dep link per
dependency, and dirty-check bookkeeping on every one of those dependencies. It pays for itself only when
re-evaluating the expression on each render would cost more than that. The render function re-runs and reads the
ref either way — only the expression body is saved.

## The three things that earn one

Any one is enough.

**Reuse** — the same derived value binds to 2+ props, or appears 2+ times in the template. Name it to match the
prop so the `:prop` shorthand works.

**Work** — the expression parses, formats, filters, maps, sorts, reduces, or otherwise walks a collection.

```ts
const descriptionHtml = computed(() => (description ? marked.parse(description, { async: false }) : ""));
const statistics = computed(() => computeDataSourceStatistics(dataSource.value));
const respondedCount = computed(() => statusRows.value.filter(({ isResponded }) => isResponded).length);
```

The render effect re-runs whenever **any** template dependency changes, not only the ones this expression reads.
Inlined, the scan re-runs with it — a markdown parse or a full-sheet statistics pass on every unrelated keystroke.

**Identity** — the expression allocates an object, array or function that is **bound to a prop**.

```ts
const categoryItems = computed<SelectItemCategoryDefinition<null | string>[]>(() => [...]);
const nameRules = computed(() => [rules.maxLength(maxLength), rules.isNotProfanity()]);
const mergedListProps = computed(() => mergeProps(listProps, listAttrs));
```

A fresh reference every render defeats the child's prop diffing. On Vuetify `:rules` it is not merely slower —
the field re-runs validation. On `:items` the select re-diffs its whole list.

## Otherwise inline it

A comparison, a boolean, a ternary, a template literal, a property read, an arithmetic op, a map lookup:

```vue
<ClickerModelListGroup v-if="buildings.length > 0">
<v-tooltip v-if="room.userId === member.id" text="Room Owner">
{{ isSelf ? `${participant.name} (You)` : participant.name }}
:src="BuildingIconMap[id]"
```

Wrapping these costs more than it saves, and the binding target infers the type an extracted computed would have
had to annotate.

## Three traps

**Identity applies only to a whole expression.** `:configuration="{ x: 30, y: 23, scaleY: isEnemy ? 0.8 : undefined }"`
already allocates a fresh object per render, so extracting `scaleY` buys no stability at all. Extract the whole
object literal or nothing.

**A getter called per `v-for` item** runs once per row inlined, once per render as a computed. Leave it as a
computed, or hoist the whole mapped list when the row count is unbounded.

**Setup-time expressions are not render expressions.** A value read once into a `ref`, a `structuredClone`, a
`new Row(...)` — these run at setup regardless, so caching them changes nothing.

## Keep regardless of cost

A computed that has a statement body, is writable (`computed({ get, set })`), or is consumed as a `Ref` — passed
to a composable, destructured `storeToRefs`-style, or returned as a composable's own surface.
