<script setup lang="ts">
import type { RoomEmojiInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useRoomEmojiDialogStore } from "@/store/message/room/emojiDialog";

interface Props {
  id: RoomEmojiInMessage["id"];
}

const { id } = defineProps<Props>();
const roomEmojiDialogStore = useRoomEmojiDialogStore();
const { deletingId } = storeToRefs(roomEmojiDialogStore);
</script>

<template>
  <UiIconButton
    label="Delete emoji"
    :meaning="UiIconMeaning.Delete"
    :variant="UiButtonVariant.Quiet"
    @click="deletingId = id"
  />
</template>
