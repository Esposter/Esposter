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

Identity is about a **fresh reference per render**, so it only applies when the literal has reactive members.
`:button-props="{ text: 'Copied' }"` is hoisted to a constant by the compiler and allocates once for the whole
module — extracting it into a computed adds an effect to cache something that was already stable.

When the allocation reads no reactive state at all, the fix is a plain setup `const`, not a `computed` —
`const fileRules = [validateFileRule]` allocates once for the instance where a computed would add an effect to
cache a value that can never change.

It also only applies to a **component prop**. `:style` and `:class` on a native element are attributes: Vue
diffs them against the DOM and there is no child component to re-render, so a fresh object there costs a cheap
patch and nothing else. `:style="{ color: topRoleColor }"` on a `<div>` stays inline; the same literal on a
component does not.

## Four traps

**Identity applies only to a whole expression.** `:configuration="{ x: 30, y: 23, scaleY: isEnemy ? 0.8 : undefined }"`
already allocates a fresh object per render, so extracting `scaleY` buys no stability at all. Extract the whole
object literal or nothing.

**A getter called per `v-for` item** runs once per row inlined, once per render as a computed. Leave it as a
computed, or hoist the whole mapped list when the row count is unbounded. An expression over a **loop variable or
a slot prop** cannot become one at all — that binding exists only in the template scope Vue created for it — so
the choice there is between the inline form and extracting the body into a component that receives the binding as
a prop, and the extraction is worth it only on the same terms as any other component split.

**A cache is only worth what the render effect wastes.** Work rests on the render effect re-running for
dependencies the expression never reads, so it stops applying where the expression's inputs _are_ the whole
dependency set — a leaf whose template reads nothing but its own props, and calls a helper on every one of them.
Nothing can invalidate the render without invalidating the cache in the same tick, so hoisting the mapped list
buys a `ComputedRefImpl` and its dep links to recompute exactly as often as the inline form did. Count the
template's distinct reactive reads before hoisting a loop: the trap above is the unbounded-row case, and this is
why row count alone does not decide it.

**Setup-time expressions are not render expressions.** A value read once into a `ref`, a `structuredClone`, a
`new Row(...)` — these run at setup regardless, so caching them changes nothing.

## Keep regardless of cost

A computed that has a statement body, is writable (`computed({ get, set })`), or is consumed as a `Ref` — passed
to a composable, destructured `storeToRefs`-style, or returned as a composable's own surface.

Also keep one whose **name is the only thing explaining the expression**, where inlining would leave the use site
harder to read than the indirection costs — most often a negated boolean feeding another condition, where
inlining produces a double negative. This is a judgement call and the weakest of the keeps: it justifies leaving
a computed alone, never extracting a new one.
