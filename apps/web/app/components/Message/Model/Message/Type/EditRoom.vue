<script setup lang="ts">
import type { MessageComponentProps } from "@/models/message/MessageComponentProps";
import type { StandardMessageEntity } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useRoomDialogStore } from "@/store/message/room/dialog";

interface Props extends MessageComponentProps<StandardMessageEntity> {}

const { active, creator, isPreview = false, message } = defineProps<Props>();
const roomDialogStore = useRoomDialogStore();
const { isEditRoomDialogOpen } = storeToRefs(roomDialogStore);
</script>

<template>
  <MessageModelMessageTypeSystemLine :active :is-preview :meaning="UiIconMeaning.Edit" :message>
    <span>{{ creator.name }}</span>
    <template v-if="message.message">
      <span text-muted> changed the room name: </span>
      <span>{{ message.message }}.</span>
    </template>
    <span v-else text-muted> removed the custom room name.</span>
    <UiInlineAction @click="isEditRoomDialogOpen = true">Edit Room</UiInlineAction>
  </MessageModelMessageTypeSystemLine>
</template>
