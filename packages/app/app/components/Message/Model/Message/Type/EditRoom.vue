<script setup lang="ts">
import type { MessageComponentProps } from "@/services/message/MessageComponentMap";

interface EditRoomProps extends MessageComponentProps {}

const { active, creator, isPreview = false, message } = defineProps<EditRoomProps>();
const displayCreatedAt = useDateFormat(() => message.createdAt, "DD/MM/YYYY H:mm");
</script>

<template>
  <MessageModelMessageTypeListItem :active :is-preview>
    <v-icon icon="mdi-pencil" size="small" />
    <span font-bold>{{ creator.name }}</span>
    <span text-gray> changed the room name: </span>
    <span font-bold>{{ message.message }}. </span>
    <span text-gray text-sm>{{ displayCreatedAt }}</span>
  </MessageModelMessageTypeListItem>
</template>
