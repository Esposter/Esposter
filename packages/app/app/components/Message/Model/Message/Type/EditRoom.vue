<script setup lang="ts">
import type { MessageComponentProps } from "@/services/message/MessageComponentMap";

interface EditRoomProps extends MessageComponentProps {}

const { active, creator, isPreview = false, message } = defineProps<EditRoomProps>();
</script>

<template>
  <MessageModelMessageTypeListItem :active :is-preview>
    <v-icon icon="mdi-pencil" size="small" />
    <span font-bold>{{ creator.name }}</span>
    <span text-gray> changed the room name: </span>
    <span font-bold>{{ message.message }}</span>
  </MessageModelMessageTypeListItem>
</template>
