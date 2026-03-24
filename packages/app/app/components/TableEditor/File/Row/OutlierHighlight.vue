<script setup lang="ts">
import { OUTLIER_HIGHLIGHT_CLASS } from "@/services/tableEditor/file/constants";

interface OutlierHighlightProps {
  isOutlier: boolean;
  text: string;
}

defineProps<OutlierHighlightProps>();
</script>

<template>
  <span :class="{ [OUTLIER_HIGHLIGHT_CLASS]: isOutlier }">{{ text }}</span>
</template>
