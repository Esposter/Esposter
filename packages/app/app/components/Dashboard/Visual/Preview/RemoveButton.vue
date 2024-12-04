<script setup lang="ts">
import type { VisualType } from "#shared/models/dashboard/data/VisualType";

import { useVisualStore } from "@/store/dashboard/visual";
import { prettify } from "@/util/text/prettify";

interface RemoveButtonProps {
  id: string;
  type: VisualType;
}

const { id, type } = defineProps<RemoveButtonProps>();
const visualStore = useVisualStore();
const { deleteVisual } = visualStore;
</script>

<template>
  <v-tooltip :text="`Remove ${prettify(type)} Visual`">
    <template #activator="{ props }">
      <v-btn absolute="!" top-0 right-0 icon="mdi-close" size="small" :="props" @click="deleteVisual(id)" />
    </template>
  </v-tooltip>
</template>
