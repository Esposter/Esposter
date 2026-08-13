<script setup lang="ts">
import type { MessageComponentProps } from "@/models/message/MessageComponentProps";
import type { StandardMessageEntity } from "@esposter/db-schema";

import { useDialogStore } from "@/store/message/room/dialog";

interface EditRoomProps extends MessageComponentProps<StandardMessageEntity> {}

const { active, creator, isPreview = false, message } = defineProps<EditRoomProps>();
const dialogStore = useDialogStore();
const { isEditRoomDialogOpen } = storeToRefs(dialogStore);
</script>

<template>
  <MessageModelMessageTypeSystemLine :active icon="mdi-pencil" :is-preview :message>
    <span font-bold>{{ creator.name }}</span>
    <template v-if="message.message">
      <span op-medium-emphasis> changed the room name: </span>
      <span font-bold>{{ message.message }}. </span>
    </template>
    <template v-else>
      <span op-medium-emphasis> removed the custom room name. </span>
    </template>
    <span text-info cursor-pointer hover:underline @click="isEditRoomDialogOpen = true">Edit Room</span>
    &nbsp;
  </MessageModelMessageTypeSystemLine>
</template>
