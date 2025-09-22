<script setup lang="ts">
import type { MessageComponentProps } from "@/services/message/MessageComponentMap";

interface EditRoomProps extends MessageComponentProps {}

const { active, creator, isPreview = false, message } = defineProps<EditRoomProps>();
</script>

<template>
  <MessageModelMessageTypeListItem :active :is-preview>
    <v-list-item-subtitle italic>
      <v-icon icon="mdi-pencil" size="small" />
      {{ creator.name }}
      changed the room name: {{ message.message }}
    </v-list-item-subtitle>
  </MessageModelMessageTypeListItem>
</template>
