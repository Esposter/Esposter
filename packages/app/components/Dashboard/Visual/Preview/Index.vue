<script setup lang="ts">
import type { VisualType } from "@/shared/models/dashboard/data/VisualType";

import { VisualTypeDemoIconMap } from "@/services/dashboard/demo/VisualTypeDemoIconMap";

interface VisualPreviewProps {
  type: VisualType;
}

const { type } = defineProps<VisualPreviewProps>();
</script>

<template>
  <TransitionFade>
    <component :is="VisualTypeDemoIconMap[type]" size-full />
  </TransitionFade>
</template>
