---
name: vue-component-patterns
description: Esposter Vue 3 component authoring — the shared Styled/App shell primitives, same level of abstraction, :key-remount and props-down initialisation of local state, the wrapper + pure-child pattern for async data, generic SFCs, per-variant type correctness, is-prefixed boolean props typed as the non-default literal, present-tense emit names, component folder naming and Nuxt auto-import name collapse, defineSlots and conditional slot forwarding, and slot extraction. Apply when writing, typing, naming, or refactoring an individual Vue component.
---

# Vue Component Patterns (Esposter)

## Shared Shell / Design-System Primitives

Cross-product chrome is a small set of shared components in `components/Styled/` (design-system) and `components/App/` (app-chrome) — **reuse them, never re-roll a bare `v-toolbar` per editor.** Their design and rationale live in `packages/app/content/docs/platform/shell-cohesion.md`; keep that spec live in the same change when you add or alter a shell primitive.

- `StyledPageHeader` — the canonical editor/page header (breadcrumb row + `actions` slot + `controls` slot). Every editor header mounts document picker / selects / search through it; controls never go inside `v-toolbar-title`. **One per route.** Its `breadcrumbs` slot falls back to `<AppBreadcrumbs :title />`, so a second `StyledPageHeader` nested under a page that already has one renders a second, title-less trail (`Home / Resources`). A toolbar _inside_ a page — a resource blade, a card header — is a plain `v-toolbar` (`px-4 py-2 b-b-1 b-border b-solid flex flex-wrap gap-2 items-center`, `v-spacer` before the trailing actions), as in `Resource/List/Toolbar.vue`, `Resource/Email/Editor.vue` and `Dashboard/Editor/Header.vue`.
- `StyledEmptyState` — icon + title + description + action slot for empty lists/states.
- `StyledSkeleton` — bordered `v-skeleton-loader` for per-region loading.
- `StyledSearchDialog` — the canonical Ctrl+K search palette (dialog + solo autofocus search field + `hotkey` prop registered via `useVHotkey`, `activator` slot, results in the default slot). Every dialog-style search UI mounts through it — never re-roll a `v-dialog` + `v-text-field` + hotkey listener (`onKeyStroke`/`useEventListener`) per feature. See `docs/architecture/search.md`.
- `AppBreadcrumbs` — route→product trail (matched against `ProductListLinkItems`), rendered by `StyledPageHeader`.

When a new product/editor is added, give its **page** a `StyledPageHeader`, a launcher entry in `ProductListLinkItems`, and — if it is resource-backed — an entry in `ResourceDefinitionMap` (`shared/services/resource/`), the single map carrying each resource type's `icon`, `title`, and route for the `/resources` hub. Document the result in the shell-cohesion spec.

## Same Level of Abstraction

Every statement in `<script setup>` must operate at the same conceptual level. Mixing low-level detail with high-level orchestration makes the component hard to read and extend.

**Rule:** If one line calls a composable encapsulating a concept, all other lines should be at that same call-site level — not implementing sub-steps inline.

```vue
<!-- WRONG: selection management is a lower-level concern mixed into orchestration -->
<script setup lang="ts">
const foos = computed(() => getFoos(parentId));
const selectedFooId = ref("");
const selectedFoo = computed(() => foos.value.find(({ id }) => id === selectedFooId.value));
watch(foos, (newFoos) => {
  if (selectedFooId.value && !newFoos.some(({ id }) => id === selectedFooId.value))
    selectedFooId.value = newFoos[0]?.id ?? "";
});
</script>

<!-- CORRECT: all lines at the same orchestration level — the store owns the selection -->
<script setup lang="ts">
const fooStore = useFooStore();
const { foos, selectedFoo, selectedFooId } = storeToRefs(fooStore);
</script>
```

**Signals abstraction levels are mixed:**

- A store or composable call sits next to a manual `ref` + `computed` + `watch` block implementing the same concept
- A `v-if="x"` guard exists only so the template body can skip absence checks (extract to a child component receiving a required prop instead)
- Inline `watch` callbacks contain multi-step logic that belongs in a composable

**Fix:** move the lower-level block to its owner — a store (selection state, shared reactive data — see the `pinia` skill) or a `use*` composable — then call it at the same level as everything else.

### Selection state: read the store, don't thread props

Once the selection lives in the store, children read it directly. This drops both the prop chain and the emit chain — a list item binds `:active="foo.id === selectedFooId"` from `storeToRefs` and calls `selectFoo()` itself, instead of the parent passing `:selected-foo-id` down and handling `@select` back up.

When a child has **local mutable state initialized from a prop**, don't watch the prop to reset it — use `:key` so the child remounts and re-initializes from the fresh prop:

```vue
<!-- ❌ watch(() => foo.fields, (newFields) => { fields.value = newFields; }) in FooEditor -->
<!-- ✅ :key remounts FooEditor on selection change -->
<FooEditor v-if="selectedFoo" :key="selectedFoo.id" :foo="selectedFoo" />
```

**Prefer props-down when the parent is adjacent and already has the data.** The child initializes from the prop — no watch, no store duplication:

```typescript
// Parent: :category-id="room?.categoryId ?? null"
const { categoryId } = defineProps<Props>();
const selectedCategoryId = ref(categoryId);
```

Only pass through an intermediate generic router component (e.g. `Content.vue`) if the prop is truly shared by all children. If only one leaf needs it, keep the store read in that leaf and initialize its ref directly.

## Async Data: Wrapper + Pure Child Pattern

When a component needs async/reactive data (e.g. a store that populates after mount), split into:

- **`Index.vue` (wrapper)** — owns data lookup + `v-if` guard; pure orchestration
- **`Form.vue` (pure child)** — receives data as a required prop; initializes local state once synchronously; no store access for the guarded data

This avoids async races where a `ref` initialized once at setup time (before the store is populated) silently overwrites real data with `""`.

```vue
<!-- Index.vue — wrapper owns the lookup and v-if guard -->
<script setup lang="ts">
const { roomId } = defineProps<{ roomId: string }>();
const { data: session } = await authClient.useSession(useFetch);
const userId = computed(() => session.value?.user.id);
const { getUserToRoomMap } = useUserToRoomStore();
const userToRoom = computed(() => (userId.value ? getUserToRoomMap(roomId)?.get(userId.value) : undefined));
</script>
<template>
  <FeatureForm v-if="userToRoom" :room-id :user-to-room="userToRoom" />
</template>

<!-- Form.vue — pure: prop is guaranteed non-undefined, ref init is safe -->
<script setup lang="ts">
const { roomId, userToRoom } = defineProps<{ roomId: string; userToRoom: UserToRoom }>();
const { updateUserToRoom } = useUserToRoomStore();
const nickname = ref(userToRoom.nickname);
</script>
```

**When to apply:** any component that reads from a store/API and initializes a local editable `ref` from that data, where the store can be empty at component creation time.

## Local Copies of Reactive Sources

A local editable copy of a reactive source is always VueUse `useCloned`, never `ref` + `watch` — see the `vue` skill's Watch Decision Tree, which owns the rule and the `sync`/`clone` options.

## Generic SFC Components

When a component's model value (or other prop) type depends on an enum/discriminant key, make the component generic:

```vue
<script setup lang="ts" generic="TKey extends SomeEnum">
// SomeEnum is a string enum (e.g. SomeEnum.A = "A"), so interface keys are string literals.
// Model values use "" as the empty-string sentinel and never `| null` (see the typescript / string-utils skills):
interface ModelValueMap {
  A: boolean;
  B: string;
}

const modelValue = defineModel<ModelValueMap[TKey]>({ required: true });
</script>
```

- Use `interface` (not `type`) for the value map — string enum values map directly to string literal keys
- Define the interface locally (not exported unless reused elsewhere)
- The map type drives inference at call sites where the key type is statically known
- For `as const satisfies` maps, use `Record<Exclude<TEnum, ExcludedVariant>, ValueType>` to exclude variants using a different component path (e.g. Boolean → checkbox, not text field)
- If TypeScript can't narrow `TKey` in template v-if/v-else branches (correlated generics limitation), fall back to the union of all possible values (e.g. `ColumnValue`) for `defineModel` — the prop type still provides call-site inference

## Component Type Correctness

**Match each component's props/model types exactly to the data it handles** — don't mix concerns via union types + `v-if` + null-coalescing inside one component.

- If logic differs per variant (e.g. date formatting for `DateColumn` vs plain text for `Column<String>`), split into focused components (`FieldInputDate.vue`, `FieldInputText.vue`)
- Each component accesses its props directly without defensive coalescing (`column.format`, not `column.type === ColumnType.Date ? column.format : ""`)
- A **dispatcher** component (e.g. `FieldInput.vue`) is acceptable at the routing level to delegate to the right sub-component — type casts in the dispatcher are necessary and acceptable at that boundary

## Boolean Props — `is` Prefix + Default-Aware Literal Typing

Two rules for every boolean prop:

1. **`is` prefix.** Boolean props read as a question: `isDense`, `isInteractive`, `isOpen` — never bare `dense` / `interactive` / `open`, and never `can*` / `should*` (prefer `is`, fall back to `has`; see global naming rules). The same applies to `defineModel` / emit payloads.

2. **Type as the non-default literal, not `boolean`.** When a boolean prop has a default, restrict its type to the only value a caller would ever pass, so passing the default is impossible (no redundant `:is-x="true"`):
   - Defaults to **false** → type `?: true`; caller opts in with the bare attribute (`<Comp is-dense />`).
   - Defaults to **true** → type `?: false` with destructure default `= true`; caller opts out with `:is-x="false"`.

```ts
// defaults false → only `true` is meaningful
interface CallStageProps {
  isDense?: true;
}
const { isDense } = defineProps<CallStageProps>(); // isDense: true | undefined

// defaults true → only `false` is meaningful
interface CallScreenShareStageProps {
  isInteractive?: false; /* ... */
}
const { isInteractive = true } = defineProps<CallScreenShareStageProps>(); // boolean at runtime
```

A **derived/computed** value still fits the literal type as long as it can only be the default or its opposite — map the default branch to `undefined` instead of widening to `boolean`:

```vue
<!-- isDense ? false : undefined → type `false | undefined`, matches `isInteractive?: false` -->
<MessageContentCallScreenShareStage :is-interactive="isDense ? false : undefined" />
```

**Exception — genuinely two-way boolean.** Use the full `boolean` type only when the prop carries a real, changeable boolean: a `v-model` / `defineModel<boolean>()`, or a ref/computed whose value legitimately flips **both** ways at the call site. A flag that only ever toggles away from its default is not this case — keep it a literal.

## Emits — Present-Tense Event Names

Emit names are **present-tense verbs**: `delete`, `update`, `create`, `save`, `submit` — never past tense (`deleted`, `updated`, `copied`). The event names the action the parent should handle, not a completed fact; past-tense names also drift from Vue/DOM convention (`click`, `submit`, `change`).

```ts
// ❌ const emit = defineEmits<{ deleted: []; updated: [] }>();
// ✅
const emit = defineEmits<{ delete: []; update: [] }>();
```

For state-sync emits, use the `update:x` form where `x` is the state name (`"update:copied": [boolean]`) — the verb stays present tense; the state name may be any shape.

## Component Folder Naming

**The folder path is the prefix — never repeat it in the filename.** Nuxt builds the auto-import name from the directory words plus the filename words, so `Feature/Group/ItemCard.vue` → `FeatureGroupItemCard` and `Feature/Group/ItemCardHeader.vue` → `FeatureGroupItemCardHeader`. `Index.vue` contributes nothing, so a folder's own root component is `Group/Index.vue` → `FeatureGroup`.

### Fold a shared prefix into a folder

**Two or more components in one directory whose names start with the same word belong in a folder named for that word** — `FooList.vue` + `FooListItem.vue` + `FooDeleteButton.vue` → `Foo/{List,ListItem,DeleteButton}.vue`. Because the folder re-supplies the word, **the generated component names are unchanged** — a pure move, no template edits.

Fold when either holds:

- the directory is **crowded** (roughly ≥10 flat components) — folding is what keeps it navigable; a 3-file feature folder is already readable and stays flat
- a file sits **beside a folder of the same name** (`Node/` + `NodeDropzoneBackground.vue`) — always untidy, fold regardless of size

Two carve-outs:

- **Don't split a suffix family.** `TypeCell` + `TypeFilterPill` share a prefix, but `TypeFilterPill` also belongs to `Status/Tag/Updated FilterPill`. Folding `Type/` scatters the family — leave it.
- **Don't nest for two.** Once a fold leaves the new folder with a handful of files, stop; `Menu/{Button,LinkList,LinkListItem}.vue` beats a further `Menu/LinkList/{Index,Item}.vue`.

The parent of a folded group becomes `Index.vue` in it (`Room/List.vue` + `Room/ListItem.vue` → `Room/List/{Index,Item}.vue`).

### Nuxt name compression

**A filename whose leading words repeat the trailing words of its folder path emits that run only once.** `Feature/ItemList/ListItem.vue` → `FeatureItemListItem`, not `FeatureItemListListItem`:

- `Feature/Group/GroupCard.vue` → `FeatureGroupCard` (not `FeatureGroupGroupCard`)
- `Feature/Items/ItemsHeader.vue` → `FeatureItemsHeader` (not `FeatureItemsItemsHeader`)

The collapse is against the folder path's **trailing run**, not just its last word, and it hits any repeat — including a word repeated from a **compound** folder name higher up (`Feature/ThisAndThat/ThatList.vue` → `FeatureThisAndThatList`).

**Rule:** the filename's first word must differ from the last word of its folder path. If they must share one, pick a more specific filename (`GroupDetailCard.vue` over `GroupCard.vue`) — otherwise two files can silently generate one name, and the naive un-collapsed tag resolves to no component and renders **empty with no error**.

This is also the one shape where folding a prefix into a folder **does** change the name: the flat file was collapsing against a word further up the path, and the folder form no longer is (`ThisAndThat/ThatList.vue` → `FeatureThisAndThatList` becomes `ThisAndThat/That/List.vue` → `FeatureThisAndThatThatList`). Update the tags in the same change.

Collapse affects **only the template tag**. A props interface is a plain TS type and does not collapse, so a redundant-looking `FeatureThisAndThatThatListProps` stays valid — don't "fix" it to match the tag.

Verify with `typecheck`, which flags an unknown collapsed tag.

## File Length

Line-count target and exceptions — see the `file-organization` skill. Component-specific extractions when a `.vue` runs long: pull toolbar/header buttons into a slot component (e.g. `TopSlot.vue`), row/column action menus into `ActionSlot.vue`, and grouped controls into their own focused component.

## Slots — `defineSlots` Required + Conditional Forwarding

**Every component that renders a `<slot>` declares `defineSlots`** — typed slot contracts, same as props:

```ts
defineSlots<{ default: () => VNode }>(); // VNode is auto-imported
defineSlots<{ default?: () => VNode; prepend?: () => VNode }>(); // `?:` when the consumer may omit the slot
defineSlots<{ activator: (props: { menuProps: Record<string, unknown> }) => VNode }>(); // scoped slot props
const slots = defineSlots<{ ... }>(); // assign only when the script reads `slots`
```

**Conditional slot forwarding — the explicit slot name is load-bearing.** When a wrapper forwards an optional slot into a library component that falls back to a prop when the slot is absent (e.g. VTooltip renders `slots.default?.() ?? props.text`), a bare `<template v-if="$slots.x">` does NOT work: the compiler puts the `v-if` _inside_ an always-registered slot function, so the library sees the slot as present and the prop fallback never fires. `v-slot` + `v-if` on the same template compiles to `createSlots` with truly conditional registration:

```vue
<!-- WRONG — slot always registered; VTooltip's text prop suppressed even with no slot content -->
<template v-if="$slots.default"><slot /></template>

<!-- CORRECT — #default + v-if compiles to conditional slot registration -->
<template v-if="$slots.default" #default><slot /></template>
```

Canonical: `Styled/Tooltip/IconButton.vue`. An unconditional `<slot />` directly inside a library component has the same always-registered problem — only safe when the wrapped component has no prop fallback for that slot.

## Slot Extraction (Complex Components)

When a component has many named slots with non-trivial content, extract each slot's content into its own component, named after the slot it fills (`#tfoot` → `FooterSlot.vue`, `#top` → `TopSlot.vue`, `#[item.actions]` → `ActionSlot.vue`).

The extracted component:

- Receives the minimum props to derive its content (e.g. `dataSource`)
- Pulls shared state from the same stores the parent uses (e.g. `useFilterStore`)
- Lives in the same folder as the parent to share the auto-import prefix

```vue
<!-- Before: inline slot content in Table.vue -->
<template #tfoot>
  <tr>
    <td v-for="column of displayColumns" :key="column.id">{{ summaries.get(column.name) }}</td>
  </tr>
</template>

<!-- After: extracted to FooterSlot.vue, used in Table.vue -->
<template #tfoot>
  <ResourceSheetRowFooterSlot :data-source="dataSource" />
</template>
```

This keeps the parent lean and makes each slot independently readable and testable.

## Page & List Composition

Decomposing a page into components, rendering repeated list items from an array, sharing a list-item shell, permission-filtered action items, one affordance per action, and singleton dialogs are the `vue-page-composition` skill's.
