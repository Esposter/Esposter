<script setup lang="ts">
import type { MessageComponentProps } from "@/services/message/MessageComponentMap";

import { useDialogStore } from "@/store/message/room/dialog";

interface EditRoomProps extends MessageComponentProps {}

const { active, creator, isPreview = false, message } = defineProps<EditRoomProps>();
const dialogStore = useDialogStore();
const { isEditRoomDialogOpen } = storeToRefs(dialogStore);
</script>

<template>
  <MessageModelMessageTypeListItem :active :is-preview>
    <template #prepend>
      <v-icon icon="mdi-pencil" size="small" />
    </template>
    <span font-bold>{{ creator.name }}</span>
    <template v-if="message.message">
      <span text-gray> changed the room name: </span>
      <span font-bold>{{ message.message }}. </span>
    </template>
    <template v-else>
      <span text-gray> removed the custom room name. </span>
    </template>
    <span class="text-info" cursor-pointer hover:underline @click="isEditRoomDialogOpen = true">Edit Room</span>
    <span>&nbsp;</span>
    <MessageModelMessageCreatedAtDate :created-at="message.createdAt" />
    <MessageModelMessageEmojiList :is-preview :message />
  </MessageModelMessageTypeListItem>
</template>
