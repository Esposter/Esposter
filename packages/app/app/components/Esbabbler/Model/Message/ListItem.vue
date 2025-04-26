<script setup lang="ts">
import type { User } from "#shared/db/schema/users";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { useMessageStore } from "@/store/esbabbler/message";
import { useMessageInputStore } from "@/store/esbabbler/messageInput";

interface MessageListItemProps {
  creator: User;
  message: MessageEntity;
}

const { message } = defineProps<MessageListItemProps>();
const messageStore = useMessageStore();
const { activeReply } = storeToRefs(messageStore);
const messageInputStore = useMessageInputStore();
const { reply } = storeToRefs(messageInputStore);
const messageHtml = useRefreshMentions(() => message.message);
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
        :id="message.rowKey"
        mt-4
        py-1="!"
        min-h-auto="!"
        :active="(active || activeReply?.rowKey === message.rowKey) && !isOpen"
        @mouseenter="isMessageActive = true"
        @mouseleave="isMessageActive = false"
      >
        <template #prepend>
          <div v-if="message.replyRowKey" relative flex flex-col items-center>
            <EsbabblerModelMessageReplySpine absolute bottom-full ml-7 mb-1 :reply-row-key="message.replyRowKey" />
            <StyledAvatar :image="creator.image" :name="creator.name" />
          </div>
          <StyledAvatar v-else :image="creator.image" :name="creator.name" />
        </template>
        <v-list-item-title>
          <EsbabblerModelMessageReply v-if="message.replyRowKey" :reply-row-key="message.replyRowKey" />
          <span font-bold>
            {{ creator.name }}
          </span>
          <span pl-2 text-gray text-xs>
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
              @update:reply="(message) => (reply = message)"
              @update:select-emoji="selectEmoji"
              @update:update-mode="(value) => (isUpdateMode = value)"
            />
          </v-hover>
        </div>
      </div>
    </template>
    <template #messagePreview>
      <v-list-item>
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

  > .v-list-item__spacer {
    width: 1rem;
  }
}

:deep(.v-list-item__content) {
  overflow: visible;
}
// We don't want to hide message content even if they added a bunch of newlines
:deep(.v-list-item-subtitle) {
  line-clamp: unset;
}
</style>
