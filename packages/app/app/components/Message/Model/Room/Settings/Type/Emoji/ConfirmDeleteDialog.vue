<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useRoomEmojiStore } from "@/store/message/room/emoji";
import { useRoomEmojiDialogStore } from "@/store/message/room/emojiDialog";
import { withFinalizerAsync } from "@esposter/shared";

interface EmojiConfirmDeleteDialogProps {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<EmojiConfirmDeleteDialogProps>();
const roomEmojiStore = useRoomEmojiStore();
const { items } = storeToRefs(roomEmojiStore);
const { deleteRoomEmoji } = roomEmojiStore;
const roomEmojiDialogStore = useRoomEmojiDialogStore();
const { deletingId } = storeToRefs(roomEmojiDialogStore);
const { isOpen, item: roomEmoji } = useSingletonDialog(deletingId, () =>
  items.value.find(({ id }) => id === deletingId.value),
);
</script>

<template>
  <StyledDeleteFormDialog
    v-if="roomEmoji"
    v-model="isOpen"
    :card-props="{ title: 'Delete Emoji' }"
    @delete="
      async (onComplete) => {
        if (!roomEmoji) return;
        const roomEmojiId = roomEmoji.id;
        await withFinalizerAsync(() => deleteRoomEmoji(roomId, { id: roomEmojiId }), onComplete);
      }
    "
  >
    Are you sure you want to delete {{ roomEmoji.name }}? Every message and reaction using it will show a placeholder
    instead.
  </StyledDeleteFormDialog>
</template>
