<script setup lang="ts">
interface OutlierHighlightProps {
  isOutlier: boolean;
  text: string;
}

defineProps<OutlierHighlightProps>();
</script>

<template>
  <span :class="{ 'bg-orange-100 ring-1 ring-orange-400': isOutlier }">{{ text }}</span>
</template>
