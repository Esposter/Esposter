<script setup lang="ts">
import type { RoomEmojiInMessage } from "@esposter/db-schema";

import { useRoomEmojiDialogStore } from "@/store/message/room/emojiDialog";

interface Props {
  id: RoomEmojiInMessage["id"];
}

const { id } = defineProps<Props>();
const roomEmojiDialogStore = useRoomEmojiDialogStore();
const { deletingId } = storeToRefs(roomEmojiDialogStore);
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ size: 'small' }"
    icon="mdi-delete"
    text="Delete Emoji"
    @click="deletingId = id"
  />
</template>
