<script setup lang="ts">
interface Props {
  src: string;
}

defineProps<Props>();
</script>

<template>
  <!-- The lowest layer of an isolated, positioned container: over its colour and under everything it holds -->
  <NuxtImg v-if="src" :src alt="" size-full inset-0 absolute z-[-1] object-cover />
</template>
