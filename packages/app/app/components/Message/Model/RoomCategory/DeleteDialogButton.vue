<script setup lang="ts">
import type { RoomCategoryInMessage } from "@esposter/db-schema";

import { useRoomCategoryStore } from "@/store/message/roomCategory";
import { withFinalizerAsync } from "@esposter/shared";

interface RoomCategoryDeleteDialogButtonProps {
  category: RoomCategoryInMessage;
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
        await withFinalizerAsync(() => deleteRoomCategory(category.id), onComplete);
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <StyledTooltipIconButton
        :button-props="{ size: 'x-small', variant: 'plain' }"
        icon="mdi-delete"
        text="Delete Category"
        @click.stop="updateIsOpen(true)"
      />
    </template>
  </StyledDeleteFormDialog>
</template>
