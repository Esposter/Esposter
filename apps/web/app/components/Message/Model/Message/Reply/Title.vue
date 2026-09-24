<script setup lang="ts">
import type { Creator } from "@/models/message/Creator";
import type { MessageEntity } from "@esposter/db-schema";

import { MessageType } from "@esposter/db-schema";

interface Props {
  creator: Creator;
  message: MessageEntity;
}

const { creator, message } = defineProps<Props>();
</script>

<template>
  <div flex flex-col>
    <MessageModelMessageReply v-if="message.replyRowKey" :row-key="message.replyRowKey" />
    <div flex gap-x-2 min-w-0 items-baseline>
      <span truncate ui-heading>{{ creator.name }}</span>
      <MessageModelMessageAppUserBadge v-if="message.type === MessageType.Webhook" self-center />
      <MessageModelMessageCreatedAtDate shrink-0 :created-at="message.createdAt" />
    </div>
  </div>
</template>
