<script setup lang="ts">
import type { MessageComponentProps } from "@/services/message/MessageComponentMap";

interface EditRoomProps extends MessageComponentProps {}

const { active, creator, isPreview = false, message } = defineProps<EditRoomProps>();
const displayCreatedAt = useDateFormat(() => message.createdAt, "DD/MM/YYYY H:mm");
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
    <span text-gray text-sm>{{ displayCreatedAt }}</span>
    <MessageModelMessageEmojiList :is-preview :message />
  </MessageModelMessageTypeListItem>
</template>
