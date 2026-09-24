<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useRoomEmojiStore } from "@/store/message/room/emoji";
import { useRoomEmojiDialogStore } from "@/store/message/room/emojiDialog";
import { withFinalizerAsync } from "@esposter/shared";

interface Props {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<Props>();
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
  <UiConfirmDialog
    v-if="roomEmoji"
    v-model="isOpen"
    confirm-label="Delete"
    title="Delete emoji"
    @confirm="
      async (onComplete) => {
        if (!roomEmoji) return;
        const roomEmojiId = roomEmoji.id;
        await withFinalizerAsync(() => deleteRoomEmoji(roomId, { id: roomEmojiId }), onComplete);
      }
    "
  >
    <p>
      Are you sure you want to delete {{ roomEmoji.name }}? Every message and reaction using it will show a placeholder
      instead.
    </p>
  </UiConfirmDialog>
</template>
