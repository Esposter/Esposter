<script setup lang="ts">
import type { User } from "#shared/db/schema/users";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { useMessageInputStore } from "@/store/esbabbler/messageInput";

interface MessageListItemProps {
  creator: User;
  message: MessageEntity;
}

const { message } = defineProps<MessageListItemProps>();
const messageInputStore = useMessageInputStore();
const { replyToMessage } = storeToRefs(messageInputStore);
const messageHtml = useRefreshMentions(message.message);
const displayCreatedAt = useDateFormat(() => message.createdAt, "h:mm A");
const isUpdateMode = ref(false);
const isMessageActive = ref(false);
const isOptionsActive = ref(false);
const isOptionsChildrenActive = ref(false);
const active = computed(
  () => isMessageActive.value || isOptionsActive.value || isOptionsChildrenActive.value || isUpdateMode.value,
);
const activeAndNotUpdateMode = computed(() => active.value && !isUpdateMode.value);
const selectEmoji = await useSelectEmoji(message);
</script>

<template>
  <EsbabblerModelMessageConfirmDeleteDialog :message>
    <template #default="{ isOpen, updateIsOpen }">
      <v-list-item
        v-if="creator.name"
        mt-4
        py-1="!"
        min-h-auto="!"
        :active="active && !isOpen"
        @mouseenter="isMessageActive = true"
        @mouseleave="isMessageActive = false"
      >
        <template #prepend>
          <StyledAvatar :image="creator.image" :name="creator.name" />
        </template>
        <v-list-item-title>
          <EsbabblerModelMessageReplyMessage
            v-if="message.replyToMessageRowKey"
            :reply-to-message-row-key="message.replyToMessageRowKey"
          />
          <span font-bold>
            {{ creator.name }}
          </span>
          <span pl-2 text-xs text-gray>
            {{ displayCreatedAt }}
          </span>
        </v-list-item-title>
        <EsbabblerModelMessageEditor
          v-if="isUpdateMode"
          :message
          @update:update-mode="(value) => (isUpdateMode = value)"
          @update:delete-mode="updateIsOpen"
        />
        <v-list-item-subtitle v-else op-100="!" v-html="messageHtml" />
        <EsbabblerModelMessageEmojiList :message-row-key="message.rowKey" />
      </v-list-item>
      <div relative z-1>
        <div
          v-show="activeAndNotUpdateMode && !isOpen"
          absolute
          right-0
          top--2
          @mouseenter="isOptionsActive = true"
          @mouseleave="isOptionsActive = false"
        >
          <v-hover #default="{ isHovering, props: hoverProps }">
            <EsbabblerModelMessageOptionsMenu
              :message
              :is-hovering
              :hover-props
              @update:delete-mode="updateIsOpen"
              @update:menu="(value) => (isOptionsChildrenActive = value)"
              @update:reply="(message) => (replyToMessage = message)"
              @update:select-emoji="selectEmoji"
              @update:update-mode="(value) => (isUpdateMode = value)"
            />
          </v-hover>
        </div>
      </div>
    </template>
    <template #messagePreview>
      <v-list-item v-if="creator.name">
        <template #prepend>
          <StyledAvatar :image="creator.image" :name="creator.name" />
        </template>
        <v-list-item-title font-bold="!">
          {{ creator.name }}
        </v-list-item-title>
        <v-list-item-subtitle op-100="!" v-html="messageHtml" />
        <EsbabblerModelMessageEmojiList :message-row-key="message.rowKey" />
      </v-list-item>
    </template>
  </EsbabblerModelMessageConfirmDeleteDialog>
</template>

<style scoped lang="scss">
:deep(.v-list-item__prepend) {
  align-self: flex-end;
}

:deep(.v-list-item__content) {
  overflow: visible;
}
// We don't want to hide message content even if they added a bunch of newlines
:deep(.v-list-item-subtitle) {
  line-clamp: unset;
}
</style>
