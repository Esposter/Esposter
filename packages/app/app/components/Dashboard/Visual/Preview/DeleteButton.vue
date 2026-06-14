<script setup lang="ts">
import type { VisualType } from "#shared/models/dashboard/data/VisualType";

import { useVisualStore } from "@/store/dashboard/visual";
import { prettify } from "@/util/text/prettify";

interface DeleteButtonProps {
  id: string;
  type: VisualType;
}

const { id, type } = defineProps<DeleteButtonProps>();
const visualStore = useVisualStore();
const { deleteVisual } = visualStore;
</script>

<template>
  <v-tooltip :text="`Delete ${prettify(type)} Visual`">
    <template #activator="{ props }">
      <v-btn right-0 top-0 absolute icon="mdi-close" size="small" :="props" @click="deleteVisual({ id })" />
    </template>
  </v-tooltip>
</template>
