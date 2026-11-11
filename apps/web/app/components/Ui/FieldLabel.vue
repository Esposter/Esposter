<script setup lang="ts">
interface Props {
  // Marks the label with the required mark, which speech announces as required once
  isRequired?: true;
  label: string;
}
// The caption a control names itself by through aria-labelledby, so it is a span: a popover trigger or a slider has no
// Control a label's for could point at
defineProps<Props>();
</script>

<template>
  <span text-sm text-muted>{{ label }} <UiRequiredMark v-if="isRequired" /></span>
</template>
