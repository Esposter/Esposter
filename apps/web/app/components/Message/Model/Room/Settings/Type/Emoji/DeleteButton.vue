<script setup lang="ts">
import type { RoomEmojiInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useRoomEmojiDialogStore } from "#src/store/message/room/emojiDialog";

interface Props {
  id: RoomEmojiInMessage["id"];
}

defineProps<Props>();
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
