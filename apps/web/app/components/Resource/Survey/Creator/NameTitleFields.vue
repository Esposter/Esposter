<script setup lang="ts">
interface Props {
  // The message the name is refused with, drawn beside the name, which an item or a column is told apart by
  error?: string;
  item: { name: string; title: string };
}

defineProps<Props>();
const emit = defineEmits<{ update: [patch: { name: string } | { title: string }] }>();
</script>

<template>
  <UiTextField :error label="Name" :model-value="item.name" @update:model-value="(name) => emit('update', { name })" />
  <UiTextField label="Title" :model-value="item.title" @update:model-value="(title) => emit('update', { title })" />
</template>
