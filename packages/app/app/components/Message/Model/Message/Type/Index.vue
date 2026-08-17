<script setup lang="ts">
import type { MessageComponentProps } from "@/models/message/MessageComponentProps";

import { getShortTimeLabel } from "@/services/dayjs/getShortTimeLabel";
import { MessageType } from "@esposter/db-schema";

defineSlots<{ default?: () => VNode }>();
const {
  active,
  creator,
  isPreview = false,
  isSameBatch: baseIsSameBatch,
  message,
} = defineProps<MessageComponentProps>();
const isSameBatch = computed(() => baseIsSameBatch && !isPreview);
const messageHtml = useMessageWithMentions(
  () => message.message,
  () => message.partitionKey,
);
</script>

<template>
  <MessageModelMessageTypeListItem :active :is-preview>
    <template #prepend>
      <div v-if="message.replyRowKey" flex flex-col items-center relative>
        <MessageModelMessageReplySpine
          ml-7.5
          mt-2.5
          top-0
          absolute
          :reply-row-key="message.replyRowKey"
          :room-id="message.partitionKey"
        />
        <StyledAvatar mt-6 :image="creator.image" :name="creator.name" />
        <MessageModelMessageAppUserBadge v-if="message.type === MessageType.Webhook" pl-2 />
      </div>
      <StyledAvatar v-else-if="!isSameBatch" :image="creator.image" :name="creator.name" />
      <span v-else :op="active ? undefined : 0" text-center text-hint>
        {{ getShortTimeLabel(message.createdAt) }}
      </span>
    </template>
    <MessageModelMessageReplyTitle v-if="message.replyRowKey || !isSameBatch" :creator :message />
    <!-- A forward only adds the quote rail and its label — the body underneath is the same one every other
      message renders, so the edited marker and the inline editor survive being forwarded -->
    <div v-if="message.isForward" flex gap-x-2>
      <div rd bg-border h-inherit w-1 />
      <MessageModelMessageTypeBody :is-preview :message :message-html>
        <template #prepend>
          <v-list-item-subtitle>
            <span italic>
              <v-icon icon="mdi-share" />
              Forwarded
            </span>
          </v-list-item-subtitle>
        </template>
        <template v-if="$slots.default" #default><slot /></template>
      </MessageModelMessageTypeBody>
    </div>
    <MessageModelMessageTypeBody v-else :is-preview :message :message-html>
      <template v-if="$slots.default" #default><slot /></template>
    </MessageModelMessageTypeBody>
  </MessageModelMessageTypeListItem>
</template>
