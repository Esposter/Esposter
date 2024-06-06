<script setup lang="ts">
import type { VisualType } from "@/models/dashboard/VisualType";
import { VisualTypeDemoComponentMap } from "@/services/dashboard/demo/VisualTypeDemoComponentMap";

interface VisualPreviewProps {
  type: VisualType;
}

const { type } = defineProps<VisualPreviewProps>();
</script>

<template>
  <TransitionFade>
    <component :is="VisualTypeDemoComponentMap[type]" size-full />
  </TransitionFade>
</template>
