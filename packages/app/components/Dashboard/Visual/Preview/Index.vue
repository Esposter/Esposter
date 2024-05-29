<script setup lang="ts">
import type { VisualType } from "@/models/dashboard/VisualType";
import { VisualTypeDemoComponentMap } from "@/services/dashboard/demo/VisualTypeDemoComponentMap";

interface VisualPreviewProps {
  type: VisualType;
}

const { type } = defineProps<VisualPreviewProps>();
</script>

<template>
  <Transition name="fade">
    <component :is="VisualTypeDemoComponentMap[type]" size="90%" />
  </Transition>
</template>
