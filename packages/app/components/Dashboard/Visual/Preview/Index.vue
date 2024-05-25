<script setup lang="ts">
import type { DashboardVisualType } from "@/models/dashboard/DashboardVisualType";
import { DashboardVisualTypeDemoComponentMap } from "@/services/dashboard/DashboardVisualTypeDemoComponentMap";

interface VisualPreviewProps {
  type: DashboardVisualType;
}

const { type } = defineProps<VisualPreviewProps>();
</script>

<template>
  <component :is="DashboardVisualTypeDemoComponentMap[type]" size="90%" />
</template>
