<script setup lang="ts">
interface Props {
  srcdoc: string;
  title: string;
}

defineProps<Props>();
</script>

<template>
  <!-- The sandbox allows scripts but blocks same-origin access so published content cannot touch viewer sessions -->
  <iframe b-none h-full w-full sandbox="allow-scripts" :srcdoc :title />
</template>
