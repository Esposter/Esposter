<script setup lang="ts">
import type { User } from "#shared/db/schema/users";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { dayjs } from "#shared/services/dayjs";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

interface MessageProps {
  active?: boolean;
  creator: User;
  isPreview?: boolean;
  message: MessageEntity;
  nextMessage?: MessageEntity;
}

defineSlots<{ default?: (props: Record<string, never>) => unknown }>();
const { active, creator, isPreview = false, message, nextMessage } = defineProps<MessageProps>();
const isSameBatch = computed(
  () =>
    !isPreview &&
    message.userId === nextMessage?.userId &&
    dayjs(message.createdAt).diff(nextMessage.createdAt, "minutes") <= 5,
);
const displayCreatedAt = useDateFormat(() => message.createdAt, "H:mm");
const messageHtml = useRefreshMentions(() => message.message);
</script>

<template>
  <v-list-item :style="isPreview ? { pointerEvents: 'none', userSelect: 'none' } : undefined" :active>
    <template #prepend>
      <div v-if="message.replyRowKey" relative flex flex-col items-center>
        <EsbabblerModelMessageReplySpine absolute top-0 mt-2.5 ml-7.5 :reply-row-key="message.replyRowKey" />
        <StyledAvatar mt-6 :image="creator.image" :name="creator.name" />
      </div>
      <StyledAvatar v-else-if="!isSameBatch" :image="creator.image" :name="creator.name" />
      <span v-else :op="active ? undefined : 0" class="created-at" text-center text-gray text-xs>
        {{ displayCreatedAt }}
      </span>
    </template>
    <v-list-item-title>
      <EsbabblerModelMessageReply v-if="message.replyRowKey" :row-key="message.replyRowKey" />
      <template v-if="message.replyRowKey || !isSameBatch">
        <span font-bold>
          {{ creator.name }}
        </span>
        <span pl-2 text-gray text-xs>
          {{ displayCreatedAt }}
        </span>
      </template>
    </v-list-item-title>
    <div flex flex-col gap-y-1>
      <template v-if="message.isForward">
        <div flex gap-x-2>
          <div class="bg-border" rd w-1 h-inherit />
          <div flex flex-col>
            <v-list-item-subtitle>
              <span italic>
                <v-icon icon="mdi-share" />
                Forwarded
              </span>
            </v-list-item-subtitle>
            <v-list-item-subtitle v-if="!EMPTY_TEXT_REGEX.test(messageHtml)" op-100="!" v-html="messageHtml" />
          </div>
        </div>
      </template>
      <slot v-else>
        <div flex gap-x-1 items-end>
          <v-list-item-subtitle v-if="!EMPTY_TEXT_REGEX.test(messageHtml)" op-100="!" v-html="messageHtml" />
          <span v-if="message.isEdited" text-gray text-2.4 line-height-3.2>(edited)</span>
        </div>
      </slot>
      <EsbabblerModelMessageFileContainer v-if="message.files.length > 0" max-w-140 :is-preview :message />
      <EsbabblerModelMessageLinkPreviewContainer
        v-if="message.linkPreviewResponse"
        :link-preview-response="message.linkPreviewResponse"
        :partition-key="message.partitionKey"
        :row-key="message.rowKey"
      />
      <EsbabblerModelMessageEmojiList :message />
    </div>
  </v-list-item>
</template>

<style scoped lang="scss">
:deep(.v-list-item__prepend) {
  align-self: flex-start;

  > .v-list-item__spacer {
    width: 1rem;
  }
}
// We don't want to hide message content even if they added a bunch of newlines
:deep(.v-list-item-subtitle) {
  line-clamp: unset;
  -webkit-line-clamp: unset;
}

.created-at {
  width: $avatar-width;
}
</style>
