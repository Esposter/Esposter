# Selection and Remounting

Read when a child needs the selection, holds local state initialised from a prop, or a `:key` is about to be bumped to refresh something.

Once the selection lives in the store, children read it directly. This drops both the prop chain and the emit chain — a list item binds `:active="foo.id === selectedFooId"` from `storeToRefs` and calls `selectFoo()` itself, instead of the parent passing `:selected-foo-id` down and handling `@select` back up.

When a child has **local mutable state initialized from a prop**, don't watch the prop to reset it — use `:key` so the child remounts and re-initializes from the fresh prop:

```vue
<!-- ❌ watch(() => foo.fields, (newFields) => { fields.value = newFields; }) in FooEditor -->
<!-- ✅ :key remounts FooEditor on selection change -->
<FooEditor v-if="selectedFoo" :key="selectedFoo.id" :foo="selectedFoo" />
```

**A `:key` names the thing being rendered, never a counter something bumps.** `:key="reloadCount"` is a manual refresh in reactive clothing: the key says nothing about what changed, every writer has to remember to bump it, and the remount throws away scroll and focus to re-fetch data the surface could have been handed. When data changes underneath a mounted surface, the writer **pushes** it — a subscription handler, or a hook registry (`services/shared/createHookRegistry.ts`) the holding stores register into.

**Prefer props-down when the parent is adjacent and already has the data** — the child initializes its ref from the prop (`const { fooId } = defineProps<Props>(); const selectedFooId = ref(fooId);`), no watch, no store duplication. Only pass through an intermediate generic router component if the prop is truly shared by all children; if only one leaf needs it, keep the store read in that leaf and initialize its ref directly.
