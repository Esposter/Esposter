<script setup lang="ts">
import { OUTLIER_HIGHLIGHT_CLASS } from "@/services/resource/sheet/constants";

interface Props {
  isOutlier: boolean;
  text: string;
}

const { isOutlier, text } = defineProps<Props>();
</script>

<template>
  <span :class="{ [OUTLIER_HIGHLIGHT_CLASS]: isOutlier }">{{ text }}</span>
</template>
