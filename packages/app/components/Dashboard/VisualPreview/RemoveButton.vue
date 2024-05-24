<script setup lang="ts">
import { useLayoutStore } from "@/store/dashboard/layout";

interface RemoveButtonProps {
  id: string;
}

const { id } = defineProps<RemoveButtonProps>();
const layoutStore = useLayoutStore();
const { removeDashboardVisual } = layoutStore;
</script>

<template>
  <v-btn absolute="!" top-0 right-2 icon="mdi-close" @click="removeDashboardVisual(id)" />
</template>
