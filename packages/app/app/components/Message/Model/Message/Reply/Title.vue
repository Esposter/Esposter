<script setup lang="ts">
import type { Creator } from "@/models/message/Creator";
import type { MessageEntity } from "@esposter/db-schema";

import { MessageType } from "@esposter/db-schema";

interface ReplyTitleProps {
  creator: Creator;
  message: MessageEntity;
}

const { creator, message } = defineProps<ReplyTitleProps>();
</script>

<template>
  <v-list-item-title>
    <MessageModelMessageReply v-if="message.replyRowKey" :row-key="message.replyRowKey" />
    <div flex items-center gap-x-2>
      <span font-bold>
        {{ creator.name }}
      </span>
      <MessageModelMessageAppUserBadge v-if="message.type === MessageType.Webhook" />
      <MessageModelMessageCreatedAtDate :created-at="message.createdAt" />
    </div>
  </v-list-item-title>
</template>
