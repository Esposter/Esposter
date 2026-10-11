<script setup lang="ts">
interface Props {
  accept: string;
}

const { accept } = defineProps<Props>();
const emit = defineEmits<{ select: [file: File | undefined] }>();
const input = useTemplateRef("input");
// The caller's own labelled control opens the picker and reads back what was picked, so the picker's input stays out
// Of the accessibility tree and the tab order. Clearing it lets the same file be picked again
defineExpose({
  open: () => input.value?.click(),
  reset: () => {
    if (input.value) input.value.value = "";
  },
});
</script>

<template>
  <input
    ref="input"
    type="file"
    :accept
    aria-hidden="true"
    tabindex="-1"
    hidden
    @change="(event) => emit('select', (event.target as HTMLInputElement).files?.[0])"
  />
</template>
