---
name: vue-component-patterns
description: Esposter Vue 3 component architecture — the shared Styled/App shell primitives, same level of abstraction, the wrapper + pure-child pattern for async data, generic SFCs, per-variant type correctness, is-prefixed boolean props typed as the non-default literal, present-tense emit names, component folder naming and Nuxt auto-import name collapse, defineSlots and conditional slot forwarding, slot extraction, array + v-for over hardcoded list items, shared list-item shells with action slots, permission-filtered action items, one affordance per action, singleton dialogs over per-item dialogs, page decomposition, and maximal component granularity. Apply when designing, decomposing, naming, or refactoring Vue components.
---

# Vue Component Patterns (Esposter)

## Shared Shell / Design-System Primitives

Cross-product chrome is a small set of shared components in `components/Styled/` (design-system) and `components/App/` (app-chrome) — **reuse them, never re-roll a bare `v-toolbar` per editor.** Their design and rationale live in `packages/app/content/docs/platform/shell-cohesion.md`; keep that spec live in the same change when you add or alter a shell primitive.

- `StyledPageHeader` — the canonical editor/page header (breadcrumb row + `actions` slot + `controls` slot). Every editor header mounts document picker / selects / search through it; controls never go inside `v-toolbar-title`.
- `StyledEmptyState` — icon + title + description + action slot for empty lists/states.
- `StyledSkeleton` — bordered `v-skeleton-loader` for per-region loading.
- `StyledSearchDialog` — the canonical Ctrl+K search palette (dialog + solo autofocus search field + `hotkey` prop registered via `useVHotkey`, `activator` slot, results in the default slot). Every dialog-style search UI mounts through it — never re-roll a `v-dialog` + `v-text-field` + hotkey listener (`onKeyStroke`/`useEventListener`) per feature. See `docs/architecture/search.md`.
- `AppBreadcrumbs` — route→product trail (matched against `ProductListLinkItems`), rendered by `StyledPageHeader`.

When a new product/editor is added, give it a `StyledPageHeader`, a launcher entry in `ProductListLinkItems`, and — if it is resource-backed — an entry in `ResourceDefinitionMap` (`shared/services/resource/`), the single map carrying each resource type's `icon`, `title`, and route for the `/resources` hub. Document the result in the shell-cohesion spec.

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

**Group components with the same prefix into a folder** — Nuxt auto-imports with the folder path as prefix, so co-located components share it without repeating it in filenames.

- `components/Feature/Group/ItemCard.vue` → `FeatureGroupItemCard`
- `components/Feature/Group/ItemCardHeader.vue` → `FeatureGroupItemCardHeader`
- The folder `Group/` provides the `FeatureGroup` prefix — no need to repeat it in the filename

**Nuxt name compression — avoid adjacent duplicate words across folder and file boundaries.** Nuxt collapses consecutive identical words when building the auto-import name. A file `components/Feature/ItemList/ListItem.vue` produces `FeatureItemListItem`, not `FeatureItemListListItem`. So if a folder ends with a word and the filename starts with the same word, that word appears only once in the generated component name — which can cause silent collisions:

- `Feature/Group/GroupCard.vue` → `FeatureGroupCard` (not `FeatureGroupGroupCard`)
- `Feature/Items/ItemsHeader.vue` → `FeatureItemsHeader` (not `FeatureItemsItemsHeader`)

**Rule:** ensure the filename's first word differs from the last word of its folder path. If they must share a word, choose a more specific filename (e.g. `GroupDetailCard.vue` instead of `GroupCard.vue`).

**When the shared word is intentional** (the folder name legitimately ends with the word the file starts with), Nuxt still collapses it — so reference the **collapsed** name in the template, never the naive un-collapsed concatenation:

- `Message/DraftsAndSent/SentList.vue` → tag is `<MessageDraftsAndSentList />`, **not** `<MessageDraftsAndSentSentList />`. The duplicated form resolves to no component and renders **empty with no error**, so it fails silently.
- `Message/DraftsAndSent/SentListItem.vue` → tag is `<MessageDraftsAndSentListItem />`.
- This collapse affects **only the template tag**. A props interface is a plain TS type and does not collapse, so `MessageDraftsAndSentSentListItemProps` remains valid (if redundant) — don't "fix" it to match the tag.

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

Canonical: `Styled/TooltipIconButton.vue`. An unconditional `<slot />` directly inside a library component has the same always-registered problem — only safe when the wrapped component has no prop fallback for that slot.

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

## List Item Rendering: Array + v-for over Hardcoded Items

**Never hardcode repeated `<v-list-item>` (or any list item) elements** when they share the same structure — extract to an array and render with `v-for`.

The array lives in `services/<domain>/` (co-located with the component's feature folder), not inline. **Constant arrays use PascalCase names.** Real examples: `services/message/room/call/CallFeatures.ts`, `services/resource/list/ResourceTypeListItems.ts`.

```ts
// services/foo/FooItems.ts — array defined here, imported by components/Foo/List.vue
export const FooItems = [
  { value: "read", title: "Read", prependIcon: "mdi-eye" },
  { value: "write", title: "Write", prependIcon: "mdi-pencil" },
] as const;
```

```vue
<!-- CORRECT: import array from services/, v-for in template -->
<script setup lang="ts">
import { FooItems } from "@/services/foo/FooItems";
</script>
<template>
  <v-list>
    <v-list-item v-for="{ value, title, prependIcon } of FooItems" :key="value" :value :title :prepend-icon />
  </v-list>
</template>
```

When the items **are** an enum with no extra per-item data, iterate the enum directly instead of mirroring it into an array — but hoist the `Object.entries` call to a script-setup `const` (see the `vue` skill's render-position rule).

**When to apply:**

- 3+ list items with the same props shape — always extract
- 2 items — extract if they'll grow or props are non-trivial
- Items differing in non-trivial ways (different slots, conditional logic) — keep separate or use a dispatcher child

## Shared List-Item Shell with an Action Slot

When **multiple list components** (different data sources/stores) render the same item layout but need **different trailing actions**, extract the shared shell into one item component with a named `#append` slot. Distinct from the array + `v-for` pattern above: there a single array drives the rows; here only the shell is shared.

```vue
<!-- shared shell: prepend + title fixed, actions via slot -->
<v-list-item :title="name">
  <template #prepend><v-avatar size="36" mr-3>...</v-avatar></template>
  <template #append><slot name="append" /></template>
</v-list-item>

<!-- each list supplies only its buttons -->
<MessageFriendsUserListItem v-for="{ id, name, image } of friends" :key="id" :image :name>
  <template #append><v-btn text="Remove" @click="$trpc.friend.deleteFriend.mutate(id)" /></template>
</MessageFriendsUserListItem>
```

Trigger: the same `v-list-item` + prepend block copy-pasted across 2+ lists (friends / blocked / requests / search).

### Shell attrs passthrough

When the shell's consumers need different root interactions (one passes `@click`, another `tabindex`), do NOT add props for them — declare `defineOptions({ inheritAttrs: false })` and spread onto the actual interactive element: `<v-list-item :="{ ...props, ...$attrs }">` (here `props` comes from a wrapping `v-hover` slot). Render optional chrome only when the consumer supplies it: `v-if="$slots.default"` around the hover/focus action toolbar. Use VueUse `useFocusWithin(useTemplateRef(...))` for focus-visibility instead of hand-rolled focusin/focusout handlers (a `@ts-expect-error TS2590` may be needed on Vuetify component refs). Examples: `Message/DraftsAndSent/BaseListItem.vue` (Draft/Scheduled/Sent), `Resource/Sheet/SelectionToolbar.vue` (Row/Column TopSlots), `Message/RightSideBar/Search/Filter/PickerList.vue` (User/Room pickers — a skeleton slot referenced twice: pending state and waypoint loader).

## Permission-Filtered Action Items: Composable + v-for

When list items or icon buttons are guarded by `v-if` permission checks, **move filtering into a composable** — the template gets a plain `v-for` with no conditions.

Use the existing `Item` type (`@/models/shared/Item`) for the array element shape. The composable reads permissions from stores internally; only pass per-item runtime data (e.g. `userId`, `isMuted`) as getter arguments.

```ts
// composables/feature/useFeatureActionItems.ts
import type { Item } from "@/models/shared/Item";

export const useFeatureActionItems = () => {
  const canDoA = computed(() => /* permission check */);
  const canDoB = computed(() => /* permission check */);

  const getActions = (targetId: string, someState: boolean): Item[] => {
    const items: Item[] = [];
    if (canDoA.value && !someState)
      items.push({ icon: "mdi-x", title: "Action A", onClick: () => doA(targetId) });
    if (canDoB.value)
      items.push({ icon: "mdi-y", title: "Action B", onClick: () => doB(targetId) });
    return items;
  };

  return { canDoA, canDoB, getActions };
};
```

```vue
<!-- CORRECT: filtered array from composable, single v-for -->
<v-list-item
  v-for="{ icon, title, onClick } of getActions(id, someState)"
  :key="title"
  :prepend-icon="icon"
  :title
  @click="onClick"
/>
```

## Icon Buttons with Tooltips: Computed Array + v-for

Repeated `v-tooltip` + `v-btn` (icon button) blocks with the same structure should be extracted to a `computed` array in a composable. Dynamic props (icon, color, tooltip text) that depend on reactive state belong in the `computed`.

```ts
// Composable defines the interface and computed
interface ControlItem {
  color?: string;
  icon: string;
  onClick: () => void;
  tooltip: string;
  variant: "plain" | "tonal";
}

const controlItems = computed<ControlItem[]>(() => [
  {
    tooltip: isActive.value ? "Deactivate" : "Activate",
    icon: isActive.value ? "mdi-off" : "mdi-on",
    color: isActive.value ? "error" : undefined,
    variant: "plain",
    onClick: toggle,
  },
  { tooltip: "Leave", icon: "mdi-exit", color: "error", variant: "tonal", onClick: leave },
]);
```

```vue
<!-- CORRECT: single v-for -->
<v-tooltip
  v-for="{ tooltip, icon, color, variant, onClick } of controlItems"
  :key="tooltip"
  :text="tooltip"
  location="bottom"
>
  <template #activator="{ props }">
    <v-btn :="props" :icon :color size="x-small" :variant :ripple="false" @click="onClick" />
  </template>
</v-tooltip>
```

**When NOT to extract:** Items rendering fundamentally different components (e.g. `StyledDeleteFormDialog` vs `StyledFormDialog` with unique slot content) — the template structure diverges too much for a shared shape.

## One Affordance Per Action — No Duplicate Behaviour

**Every action gets exactly one visible way to trigger it.** Two controls that do the identical thing are not "convenience" — they make the user stop and ask whether the two differ, and they double the surface that has to stay in sync.

The resource list had three routes to the same destination per row: the row's `@click:row`, a `text-info` `NuxtLink` on the name, and an `Open` icon button in the actions column (plus an `Open` item in the right-click menu). All four navigated to `RoutePath.Resource(item.id)`. Now the row click is the only one, and the name renders as plain text.

When you find duplicates, keep the affordance with the **largest hit target and the least chrome**, and delete the rest:

```vue
<!-- WRONG — the name link and the Open button both repeat the row click -->
<template #[`item.name`]="{ item }">
  <NuxtLink text-info :to="RoutePath.Resource(item.id)" @click.stop>{{ item.name }}</NuxtLink>
</template>
<template #[`item.actions`]="{ item }">
  <StyledTooltipIconButton icon="mdi-open-in-new" text="Open" @click="navigateTo(RoutePath.Resource(item.id))" />
</template>

<!-- CORRECT — row click navigates; the name is plain text (drop the slot entirely), actions hold only what the row click can't do -->
<template #[`item.actions`]="{ item }">
  <StyledOverflowMenu :items="getActionItems(item)" @click.stop />
</template>
```

Corollaries:

- **Don't style non-links like links.** `text-info` + underline is a promise of a distinct navigation target. If the row already navigates, the name is plain text — styling it as a link implies it goes somewhere else.
- **A different trigger for the same command is not a duplicate.** A right-click context menu and a row `⋮` menu are two triggers for one list of commands — that is fine, and they must be driven by **one** shared `Item[]` (see [Permission-Filtered Action Items](#permission-filtered-action-items-composable--v-for)). What is banned is a second _visible_ control for a command that already has one.
- **A genuinely different behaviour is not a duplicate.** `Open in new tab` survives next to row-click because it does something row-click cannot.
- If a slot exists only to re-render the default value (`{{ item.name }}`), delete the slot and let the default rendering do it.

## Singleton Dialogs — Store-Driven Target, Never Per-Item

**Never mount a dialog (or any heavy overlay subtree) inside a list item.** A `v-for` over N items with an embedded `v-dialog`/menu creates N full component trees that all mount, hydrate, and re-render together — the root cause of a seconds-long INP on the messages page. The full rationale and canonical wiring live in `packages/app/content/docs/architecture/singleton-dialogs.md`; keep that page updated when this pattern evolves.

The pattern (three parts):

1. **Target ref in a per-service dialog store** — dialog UI state never lives in a business-logic store. Each service gets its own dialog store next to its business store (`store/message/dialog.ts` → `useMessageDialogStore`, `store/post/dialog.ts`, `store/resource/sheet/rowDialog.ts`, …) holding only targets like `deletingId` / `editingColumnName`. Targets are strings defaulting to `""` — never `undefined` (empty-string default rule).
2. **Action buttons write the target** — the per-item button is a dumb `StyledTooltipIconButton` with `@click.stop="deletingId = item.id"`. No activator slots, no emit plumbing up the tree.
3. **One dialog instance mounted at list level** — a `ConfirmDeleteDialog.vue`/`EditDialog.vue` singleton mounted once (in the list/table/page component). It resolves the full item from the business store by target, guards with `v-if="item"`, and derives its model via `useSingletonDialog`:

```ts
// composables/useSingletonDialog.ts — writable v-model over the target ref
const isOpen = useSingletonDialog(deletingId); // get: Boolean(target); set false: target = ""
```

```vue
<!-- singleton dialog: resolve item from store, v-if guard, v-model via useSingletonDialog -->
<!-- cardProps carries the header (title/subtitle/prependIcon) only — the message goes in the default slot -->
<StyledDeleteFormDialog v-if="item" v-model="isOpen" :card-props="{ title: 'Delete Foo' }" @delete="...">
  Are you sure you want to delete <b>{{ item.name }}</b>?
</StyledDeleteFormDialog>
```

- When the dialog needs per-open local state (a `structuredClone` edit draft), mount it `v-if`-guarded **with a `:key`** at the list level so it re-creates per target: `<ResourceSheetRowEditDialog v-if="editingRow" :key="editingRow.id" :row="editingRow" />`.
- Hover toolbars / options menus in list items follow the same idea with `v-if` (mount on hover), not `v-show` — see `Message/Model/Message/List/Item.vue`.
- Single-instance dialogs (one create button per toolbar, one settings dialog per page) may keep the button+dialog combined component — the rule targets per-item multiplication.

Canonical examples: `Message/Model/Message/ConfirmDeleteDialog.vue`, `Resource/Sheet/Column/{ActionSlot,Table,EditDialog,ConfirmDeleteDialog}.vue`, `Message/Model/Room/Settings/Dialog.vue`.

## Page Decomposition — Pages are Layout + Composition

Pages (`pages/**/*.vue`) should be **presentation-only orchestrators**: layout structure, `<Head>`, `definePageMeta`/`defineRouteRules`, and composed sub-components. All action logic, validation, and reactive state live in the sub-components or composables they own.

**Rule:** If a page contains a `ref`, `computed`, or named function belonging to a single interactive element (a button, a form), extract that element into its own component. The page's `<script setup>` should read like a bill of materials — imports and metadata, nothing else.

```vue
<!-- WRONG: page owns startCall logic and isCreating state -->
<script setup lang="ts">
definePageMeta({ middleware: "auth" });
const isCreating = ref(false);
const startCall = async () => { ... };
const callCodeOrLink = ref("");
const canJoin = computed(() => ...);
</script>

<!-- CORRECT: page delegates entirely to focused sub-components -->
<script setup lang="ts">
import { CallFeatures } from "@/services/message/room/call/CallFeatures";
definePageMeta({ middleware: "auth" });
</script>
<template>
  <MessageContentCallStartButton />
  <MessageContentCallJoinForm />
  <MessageContentCallFeatureCard v-for="feature of CallFeatures" :key="feature.title" :="feature" />
</template>
```

- **Button components** — own their loading state (`isCreating`, `isDeleting`), the async action, and navigation. Template is just `v-tooltip` + `v-btn`.
- **Form components** — own their field refs, validation computeds, and submit handler. Template is the `v-form` block.
- **Constant arrays** (feature lists, nav items) — live in `services/<domain>/` (e.g. `services/message/room/call/CallFeatures.ts`), never inline in the page.

## Maximal Component Granularity — One Action per Component

Default to the **smallest coherent unit**. Each component should be stupid simple — ideally one component maps to one action / function / concern. This applies to **any** component, not just buttons: whenever a part of a component has its own distinct responsibility, extract it.

### Extract every action control into its own component

An action button is **not** a leaf — it owns logic. Extract each `v-btn` (with its `v-tooltip`, its click handler, and the store access it needs) into its own component, so the list item / page keeps no action logic:

```vue
<!-- ❌ list item owning 4 inline tooltip+btn blocks and their handlers -->
<!-- ✅ list item is pure layout; each button owns its action end to end -->
<v-list-item>
  ...
  <FooDeleteButton :foo />
  <FooEditButton :foo />
  <FooSendButton :foo />
</v-list-item>
```

The button component holds its own store wiring, and its single-use handler stays **inline in the template** (the `vue` skill's inline-handler rule) — don't extract it to a named script function.

- **List items / rows reduce to pure layout** — avatar, title, subtitle, time, and a row of extracted button/menu components.
- **A button with a keyboard shortcut is its own component** owning both the `v-btn` and the `onKeyStroke` handler (e.g. `UndoButton.vue`) — never wire the shortcut in the parent.
- **A `v-menu` and its items is one component** — the menu plus its list items are one coherent unit.
- **Multi-step logic reused by 2+ buttons** goes into a `use*` composable (e.g. `useCancelScheduledMessageJob`, shared by the send/edit buttons and the more-menu). A composable is reuse, not single-use extraction — it doesn't violate the inline-handler rule. Single-function composables return the function directly.

### Allowed grouping (do NOT split these)

Keep together only when items are genuinely the same logic: buttons/items rendered via `v-for` over a config array (PascalCase, in `services/<domain>/`), or a coherent group driven by one config (a `v-tabs` from a `tabs` array, an icon-button toolbar from a `computed` array).

**`v-for` does not exempt the item body.** Iterating is shared structure; per-item _logic_ is not. If each iterated item carries its own handler, store wiring, or multi-step logic, the item body becomes **its own component** rendered inside the `v-for` — the parent's loop stays pure layout. Only inline the item body when it is a plain prop spread with no own logic.

### Do NOT over-extract

Granularity must **simplify the problem** or enable **reuse**. Skip refactors that do neither:

- A wrapper that only forwards props/attrs and needs `inheritAttrs: false` plumbing just to make a click reach the inner element is an anti-pattern — inline the `v-tooltip` + `v-btn` instead.
- Don't extract a component that is used in exactly one place and removes no logic from its parent (pure passthrough). Extract when the child owns a distinct responsibility (an action, a form, a self-contained piece of layout), not to hit a line count.
