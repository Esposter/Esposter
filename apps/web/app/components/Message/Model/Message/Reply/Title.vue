<script setup lang="ts">
import type { ClientMessage } from "@/models/message/ClientMessage";
import type { Creator } from "@/models/message/Creator";

import { MessageType } from "@esposter/db-schema";

interface Props {
  creator: Creator;
  message: ClientMessage;
}

defineProps<Props>();
</script>

<template>
  <div flex flex-col>
    <MessageModelMessageReply v-if="message.replyToId" :message-id="message.replyToId" :room-id="message.roomId" />
    <div flex gap-x-2 min-w-0 items-baseline>
      <span truncate ui-heading>{{ creator.name }}</span>
      <MessageModelMessageAppUserBadge v-if="message.type === MessageType.Webhook" self-center />
      <MessageModelMessageCreatedAtDate shrink-0 :created-at="message.createdAt" />
    </div>
  </div>
</template>
