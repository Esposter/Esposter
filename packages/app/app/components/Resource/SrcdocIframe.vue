<script setup lang="ts">
interface ResourceSrcdocIframeProps {
  srcdoc: string;
  title: string;
}

const { srcdoc, title } = defineProps<ResourceSrcdocIframeProps>();
</script>

<template>
  <!-- The sandbox allows scripts but blocks same-origin access so published content cannot touch viewer sessions -->
  <iframe border-none w-full h="[calc(100dvh-var(--app-bar-height))]" sandbox="allow-scripts" :srcdoc :title />
</template>
