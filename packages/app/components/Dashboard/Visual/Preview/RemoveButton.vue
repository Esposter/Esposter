<script setup lang="ts">
import type { VisualType } from "@/models/dashboard/VisualType";
import { useVisualStore } from "@/store/dashboard/visual";

interface RemoveButtonProps {
  id: string;
  type: VisualType;
}

const { id, type } = defineProps<RemoveButtonProps>();
const visualStore = useVisualStore();
const { removeVisual } = visualStore;
</script>

<template>
  <v-tooltip :text="`Remove ${type} Visual`">
    <template #activator="{ props }">
      <v-btn absolute="!" top-0 right-0 icon="mdi-close" size="small" :="props" @click="removeVisual(id)" />
    </template>
  </v-tooltip>
</template>
