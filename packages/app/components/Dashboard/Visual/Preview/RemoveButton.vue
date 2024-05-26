<script setup lang="ts">
import { useLayoutStore } from "@/store/dashboard/layout";
import type { DashboardVisualType } from "@/models/dashboard/DashboardVisualType";

interface RemoveButtonProps {
  id: string;
  type: DashboardVisualType;
}

const { id, type } = defineProps<RemoveButtonProps>();
const layoutStore = useLayoutStore();
const { removeVisual } = layoutStore;
</script>

<template>
  <v-tooltip :text="`Remove ${type} Visual`">
    <template #activator="{ props }">
      <v-btn absolute="!" top-0 right-0 icon="mdi-close" size="small" :="props" @click="removeVisual(id)" />
    </template>
  </v-tooltip>
</template>
