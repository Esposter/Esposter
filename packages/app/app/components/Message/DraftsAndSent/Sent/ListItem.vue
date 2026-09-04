<script setup lang="ts">
import type { MessageEntity, RoomInMessage } from "@esposter/db-schema";

import { getDisplayTime } from "@/services/message/draftsAndSent/getDisplayTime";
import { RoutePath } from "@esposter/shared";

interface Props {
  message: MessageEntity;
  room: RoomInMessage;
}

const { message, room } = defineProps<Props>();
</script>

<template>
  <MessageDraftsAndSentBaseListItem
    :display-time="getDisplayTime(message.createdAt)"
    :subtitle="message.message"
    :title="room.name"
    :to="RoutePath.MessagesMessage(message.partitionKey, message.rowKey)"
  >
    <template #prepend>
      <StyledAvatar :image="room.image" :name="room.name" />
    </template>
  </MessageDraftsAndSentBaseListItem>
</template>
