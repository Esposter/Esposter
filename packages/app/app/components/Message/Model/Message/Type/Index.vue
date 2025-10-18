<script setup lang="ts">
import type { MessageComponentProps } from "@/services/message/MessageComponentMap";

import { dayjs } from "#shared/services/dayjs";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

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
const messageHtml = useMessageWithMentions(() => message.message);
</script>

<template>
  <MessageModelMessageTypeListItem :active :is-preview>
    <template #prepend>
      <div v-if="message.replyRowKey" relative flex flex-col items-center>
        <MessageModelMessageReplySpine absolute top-0 mt-2.5 ml-7.5 :reply-row-key="message.replyRowKey" />
        <!-- @TODO: Fetch app users in the future as the source of truth -->
        <StyledAvatar mt-6 :image="creator.image" :name="creator.name ?? ''" />
      </div>
      <StyledAvatar v-else-if="!isSameBatch" :image="creator.image" :name="creator.name ?? ''" />
      <span v-else :op="active ? undefined : 0" text-center text-gray text-xs>
        {{ displayCreatedAtShort }}
      </span>
    </template>
    <v-list-item-title>
      <MessageModelMessageReply v-if="message.replyRowKey" :row-key="message.replyRowKey" />
      <template v-if="message.replyRowKey || !isSameBatch">
        <span font-bold>
          {{ creator.name }}
        </span>
        <MessageModelMessageCreatedAtDate pl-2 :created-at="message.createdAt" />
      </template>
    </v-list-item-title>
    <div v-if="message.isForward" flex gap-x-2>
      <div class="bg-border" w-1 h-inherit rd />
      <div flex flex-col gap-y-1>
        <v-list-item-subtitle>
          <span italic>
            <v-icon icon="mdi-share" />
            Forwarded
          </span>
        </v-list-item-subtitle>
        <v-list-item-subtitle v-if="!EMPTY_TEXT_REGEX.test(messageHtml)" op-100="!" v-html="messageHtml" />
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
          <v-list-item-subtitle v-if="!EMPTY_TEXT_REGEX.test(messageHtml)" op-100="!" v-html="messageHtml" />
          <span v-if="message.isEdited" text-gray text-2.4 line-height-3.2>(edited)</span>
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
