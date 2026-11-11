<script setup lang="ts">
import type { BooleanColumn } from "#shared/models/resource/sheet/column/BooleanColumn";

interface Props {
  column: BooleanColumn;
  isInline?: true;
}

const modelValue = defineModel<boolean | null>({ required: true });
const { isInline } = defineProps<Props>();
const container = useTemplateRef("container");

// A cell opens its editor in place of its text, so the box takes focus at once; leaving it is what saves the edit
onMounted(() => {
  if (isInline) container.value?.querySelector("button")?.focus();
});
</script>

<template>
  <!-- Inline, the cell has given up its padding to the editor, so the box keeps the text's start -->
  <div ref="container" :class="{ 'px-3': isInline }">
    <UiCheckbox
      :is-label-shown="isInline ? undefined : true"
      :label="column.name"
      :model-value="modelValue ?? false"
      @update:model-value="modelValue = $event"
    />
  </div>
</template>
