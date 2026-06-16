<script setup lang="ts">
import type { MessageEntity, RoomInMessage } from "@esposter/db-schema";

import { getDisplayTime } from "@/services/message/draftsAndSent/getDisplayTime";
import { RoutePath } from "@esposter/shared";

interface MessageDraftsAndSentSentListItemProps {
  message: MessageEntity;
  room: RoomInMessage;
}

const { message, room } = defineProps<MessageDraftsAndSentSentListItemProps>();
</script>

<template>
  <v-list-item @click="navigateTo(RoutePath.MessagesMessage(message.partitionKey, message.rowKey))">
    <template #prepend>
      <StyledAvatar :image="room.image" :name="room.name" />
    </template>
    <v-list-item-title font-bold>{{ room.name }}</v-list-item-title>
    <v-list-item-subtitle>
      <span v-html="message.message" />
    </v-list-item-subtitle>
    <template #append>
      <span op-medium-emphasis text-body-small>{{ getDisplayTime(message.createdAt) }}</span>
    </template>
  </v-list-item>
</template>
