<script setup lang="ts">
import type { MessageComponentProps } from "@/models/message/MessageComponentProps";

import { getShortTimeLabel } from "@/util/date/getShortTimeLabel";

defineSlots<{ default?: () => VNode }>();
const {
  active,
  creator,
  isPreview = false,
  isSameBatch: baseIsSameBatch,
  message,
} = defineProps<MessageComponentProps>();
const isSameBatch = computed(() => baseIsSameBatch && !isPreview);
const messageHtml = useMessageHtml(
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
        <UiAvatar mt-6 :image="creator.image ?? ''" :name="creator.name" />
      </div>
      <UiAvatar v-else-if="!isSameBatch" :image="creator.image ?? ''" :name="creator.name" />
      <!-- A message that continues its author's batch shows its time in the author's column, and only while it is the
        Row being acted on -->
      <span v-else :class="{ 'op-0': !active }" text-sm text-muted text-center>
        {{ getShortTimeLabel(message.createdAt) }}
      </span>
    </template>
    <MessageModelMessageReplyTitle v-if="message.replyRowKey || !isSameBatch" :creator :message />
    <!-- A forward only adds the quote rail and its label — the body underneath is the same one every other
      message renders, so the edited marker and the inline editor survive being forwarded -->
    <div v-if="message.isForward" pl-3 ui-guide>
      <MessageModelMessageTypeBody :is-preview :message :message-html>
        <template #prepend>
          <span text-sm text-muted flex gap-1 italic items-center>
            <span class="i-mdi:share" size-6 />
            Forwarded
          </span>
        </template>
        <template v-if="$slots.default" #default><slot /></template>
      </MessageModelMessageTypeBody>
    </div>
    <MessageModelMessageTypeBody v-else :is-preview :message :message-html>
      <template v-if="$slots.default" #default><slot /></template>
    </MessageModelMessageTypeBody>
  </MessageModelMessageTypeListItem>
</template>
