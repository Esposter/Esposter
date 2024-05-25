<script setup lang="ts">
import type { DashboardVisualType } from "@/models/dashboard/DashboardVisualType";
import { DashboardVisualTypeDemoComponentMap } from "@/services/dashboard/DashboardVisualTypeDemoComponentMap";

interface VisualPreviewProps {
  type: DashboardVisualType;
}

const { type } = defineProps<VisualPreviewProps>();
</script>

<template>
  <StyledCard size-full>
    <component :is="DashboardVisualTypeDemoComponentMap[type]" size-full />
  </StyledCard>
</template>
