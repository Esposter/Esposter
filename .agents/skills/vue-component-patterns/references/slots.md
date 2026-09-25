# Declaring, forwarding and extracting slots

Read when a component declares a slot, forwards an optional slot into a library component, or a named slot's content has grown non-trivial. That every component rendering a `<slot>` must declare `defineSlots` is in `SKILL.md`.

## `defineSlots` forms

```ts
defineSlots<{ default: () => VNode }>(); // VNode is auto-imported
defineSlots<{ default?: () => VNode; prepend?: () => VNode }>(); // `?:` when the consumer may omit the slot
defineSlots<{ activator: (props: { menuProps: Record<string, unknown> }) => VNode }>(); // scoped slot props
const slots = defineSlots<{ ... }>(); // assign only when the script reads `slots`
```

## Conditional slot forwarding — the explicit slot name is load-bearing

When a wrapper forwards an optional slot into a component that draws fallback content when the slot is absent (`UiItemContent` draws the item's own avatar or icon unless a `mark` slot is passed), a bare `<template v-if="$slots.x">` does NOT work: the compiler puts the `v-if` _inside_ an always-registered slot function, so the component sees the slot as present and its fallback never renders. `v-slot` + `v-if` on the same template compiles to `createSlots` with truly conditional registration:

```vue
<!-- WRONG — slot always registered; the fallback mark is suppressed even with no slot content -->
<template v-if="$slots.mark"><slot name="mark" /></template>

<!-- CORRECT — #mark + v-if compiles to conditional slot registration -->
<template v-if="$slots.mark" #mark><slot name="mark" /></template>
```

Canonical: `Ui/List/Row.vue`. An unconditional `<slot />` directly inside such a component has the same always-registered problem — only safe when the wrapped component has no fallback for that slot.

## Fallback content is replaced whole — pass the state it read as a slot prop

`<slot>` fallback content is an all-or-nothing default: the moment a consumer supplies the slot, the fallback is gone, including any internal state its `v-if` depended on. So a fallback that reads private state (`<slot><UiSpinner v-if="isLoading" /></slot>`) silently hands the consumer a **less capable** slot than the default it replaced — their content renders whenever the slot renders, with no way to ask "is it loading?".

Declare that state as a scoped slot prop whenever the fallback branches on it, so both paths see the same thing:

```ts
defineSlots<{ default?: (props: { isLoading: boolean }) => VNode }>();
```

Where the component deliberately keeps the state private, say so at the declaration and in the skill that owns the component — an always-visible placeholder is a reasonable contract, but only if it is a documented one rather than a surprise (`Styled/Waypoint.vue`, and the `pagination` skill).

## Slot extraction (complex components)

When a component has many named slots with non-trivial content, extract each slot's content into its own component, named after the slot it fills (`#no-data` → `NoDataSlot.vue`, `#top` → `TopSlot.vue`, `#[item.actions]` → `ActionSlot.vue`).

The extracted component:

- Receives the minimum props to derive its content (e.g. `foo`)
- Pulls shared state from the same stores the parent uses
- Lives in the same folder as the parent to share the auto-import prefix

```vue
<!-- Before: inline slot content in Foo/Table.vue -->
<template #no-data>
  <div p-8 text-center flex flex-col gap-3 items-center>
    <p text-muted>No {{ foo.name }} yet</p>
    <UiButton @click="createFoo()">Create one</UiButton>
  </div>
</template>

<!-- After: extracted to NoDataSlot.vue, used in Foo/Table.vue -->
<template #no-data>
  <FooTableNoDataSlot :foo />
</template>
```

This keeps the parent lean and makes each slot independently readable and testable.
