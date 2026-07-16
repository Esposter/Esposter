<script setup lang="ts">
import type { RoomCategoryInMessage } from "@esposter/db-schema";

import { useRoomCategoryDialogStore } from "@/store/message/roomCategoryDialog";

interface RoomCategoryDeleteButtonProps {
  category: RoomCategoryInMessage;
}

const { category } = defineProps<RoomCategoryDeleteButtonProps>();
const roomCategoryDialogStore = useRoomCategoryDialogStore();
const { deletingId } = storeToRefs(roomCategoryDialogStore);
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ size: 'x-small', variant: 'plain' }"
    icon="mdi-delete"
    text="Delete Category"
    @click.stop="deletingId = category.id"
  />
</template>
