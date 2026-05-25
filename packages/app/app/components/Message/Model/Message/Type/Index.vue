<script setup lang="ts">
import type { MessageComponentProps } from "@/models/message/MessageComponentProps";

import { dayjs } from "#shared/services/dayjs";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
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
const displayCreatedAtShort = computed(() => dayjs(message.createdAt).format("H:mm"));
const messageHtml = useMessageWithMentions(
  () => message.message,
  () => message.partitionKey,
);
</script>

<template>
  <MessageModelMessageTypeListItem :active :is-preview>
    <template #prepend>
      <div v-if="message.replyRowKey" flex flex-col items-center relative>
        <MessageModelMessageReplySpine ml-7.5 mt-2.5 top-0 absolute :reply-row-key="message.replyRowKey" />
        <StyledAvatar mt-6 :image="creator.image" :name="creator.name" />
        <MessageModelMessageAppUserBadge v-if="message.type === MessageType.Webhook" pl-2 />
      </div>
      <StyledAvatar v-else-if="!isSameBatch" :image="creator.image" :name="creator.name" />
      <span v-else :op="active ? undefined : 0" text-xs text-gray text-center>
        {{ displayCreatedAtShort }}
      </span>
    </template>
    <MessageModelMessageReplyTitle v-if="message.replyRowKey || !isSameBatch" :creator :message />
    <div v-if="message.isForward" flex gap-x-2>
      <div rd bg-border h-inherit w-1 />
      <div flex flex-col gap-y-1>
        <v-list-item-subtitle>
          <span italic>
            <v-icon icon="mdi-share" />
            Forwarded
          </span>
        </v-list-item-subtitle>
        <v-list-item-subtitle v-if="!EMPTY_TEXT_REGEX.test(messageHtml)" op-100 v-html="messageHtml" />
        <MessageModelMessageFileContainer v-if="message.files.length > 0" max-w-140 :is-preview :message />
        <MessageModelMessageLinkPreviewContainer
          v-if="message.linkPreviewResponse"
          :link-preview-response="message.linkPreviewResponse"
          :partition-key="message.partitionKey"
          :row-key="message.rowKey"
        />
        <MessageModelMessageEmojiList :is-preview :message />
      </div>
    </div>
    <div v-else flex flex-col gap-y-1>
      <slot>
        <div flex gap-x-1 items-end>
          <v-list-item-subtitle v-if="!EMPTY_TEXT_REGEX.test(messageHtml)" op-100 v-html="messageHtml" />
          <span v-if="message.isEdited" text-2.4 text-gray line-height-3.2>(edited)</span>
        </div>
      </slot>
      <MessageModelMessageFileContainer v-if="message.files.length > 0" max-w-140 :is-preview :message />
      <MessageModelMessageLinkPreviewContainer
        v-if="message.linkPreviewResponse"
        :link-preview-response="message.linkPreviewResponse"
        :partition-key="message.partitionKey"
        :row-key="message.rowKey"
      />
      <MessageModelMessageEmojiList :is-preview :message />
    </div>
  </MessageModelMessageTypeListItem>
</template>
