# Wrapper and Pure Child

Read when a component initialises a local editable ref from data a store or API may not have yet.

When a component needs async/reactive data (e.g. a store that populates after mount), split into:

- **`Index.vue` (wrapper)** — owns the data lookup + the `v-if` guard; pure orchestration.
- **`Form.vue` (pure child)** — receives the data as a **required** prop and initializes local state once, synchronously; no store access for the guarded data.

This avoids async races where a `ref` initialized once at setup time (before the store is populated) silently overwrites real data with `""`.

```vue
<!-- Index.vue — wrapper owns the lookup and v-if guard -->
<template>
  <FooForm v-if="foo" :foo :parent-id />
</template>

<!-- Form.vue — pure: prop is guaranteed non-undefined, so the ref init is safe -->
<script setup lang="ts">
interface Props {
  foo: Foo;
  parentId: string;
}

const { foo, parentId } = defineProps<Props>();
const bar = ref(foo.bar);
</script>
```

**When to apply:** any component that reads from a store/API and initializes a local editable `ref` from that data, where the store can be empty at component creation time.

A local editable copy of a reactive source is always VueUse `useCloned`, never `ref` + `watch` — the `vue` skill's watch decision tree owns that rule and its `sync`/`clone` options.
