<script setup lang="ts">
interface Props {
  // Drawn for sight alone, by a control that says it is required itself through aria-required, so speech says it once
  isSilent?: true;
}

defineProps<Props>();
</script>

<template>
  <span text-error>
    <span aria-hidden="true">*</span>
    <span v-if="!isSilent" sr-only> required</span>
  </span>
</template>
