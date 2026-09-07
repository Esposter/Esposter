<script setup lang="ts">
interface Props {
  srcdoc: string;
  title: string;
}

const { srcdoc, title } = defineProps<Props>();
</script>

<template>
  <!-- The sandbox allows scripts but blocks same-origin access so published content cannot touch viewer sessions -->
  <iframe b-none w-full h="[calc(100dvh_-_--app-bar-height)]" sandbox="allow-scripts" :srcdoc :title />
</template>
