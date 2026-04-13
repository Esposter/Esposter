<script setup lang="ts">
import type { RoomCategory } from "@esposter/db-schema";

import { useRoomCategoryStore } from "@/store/message/roomCategory";

interface RoomCategoryDeleteDialogButtonProps {
  category: RoomCategory;
}

const { category } = defineProps<RoomCategoryDeleteDialogButtonProps>();
const roomCategoryStore = useRoomCategoryStore();
const { deleteRoomCategory } = roomCategoryStore;
</script>

<template>
  <StyledDeleteFormDialog
    :card-props="{ title: 'Delete Category', text: `Are you sure you want to delete ${category.name}?` }"
    @delete="
      async (onComplete) => {
        try {
          await deleteRoomCategory(category.id);
        } finally {
          onComplete();
        }
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-tooltip text="Delete Category">
        <template #activator="{ props }">
          <v-btn icon="mdi-delete" size="x-small" variant="plain" :="props" @click.stop="updateIsOpen(true)" />
        </template>
      </v-tooltip>
    </template>
  </StyledDeleteFormDialog>
</template>
