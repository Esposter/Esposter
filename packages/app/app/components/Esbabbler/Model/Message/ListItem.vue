<script setup lang="ts">
import type { User } from "#shared/db/schema/users";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { dayjs } from "#shared/services/dayjs";
import { useEsbabblerStore } from "@/store/esbabbler";
import { useMessageStore } from "@/store/esbabbler/message";
import { useMessageInputStore } from "@/store/esbabbler/messageInput";

interface MessageListItemProps {
  creator: User;
  message: MessageEntity;
  nextMessage?: MessageEntity;
}

const { creator, message, nextMessage } = defineProps<MessageListItemProps>();
const isSameBatch = computed(
  () => message.userId === nextMessage?.userId && dayjs(message.createdAt).diff(nextMessage.createdAt, "minutes") <= 5,
);
const esbabblerStore = useEsbabblerStore();
const { optionsMenu } = storeToRefs(esbabblerStore);
const messageStore = useMessageStore();
const { activeReplyRowKey } = storeToRefs(messageStore);
const messageInputStore = useMessageInputStore();
const { forwardRowKey, replyRowKey } = storeToRefs(messageInputStore);
const messageHtml = useRefreshMentions(() => message.message);
const displayCreatedAt = useDateFormat(() => message.createdAt, "H:mm");
const isUpdateMode = ref(false);
const isMessageActive = ref(false);
const isOptionsActive = ref(false);
const isOptionsChildrenActive = ref(false);
const isDisabled = computed(() => optionsMenu.value && optionsMenu.value.rowKey !== message.rowKey);
const active = computed(
  () =>
    !isDisabled.value &&
    (isMessageActive.value || isOptionsActive.value || isOptionsChildrenActive.value || isUpdateMode.value),
);
const activeAndNotUpdateMode = computed(() => active.value && !isUpdateMode.value);
const selectEmoji = await useSelectEmoji(message);

watch(optionsMenu, (newOptionsMenu) => {
  isOptionsChildrenActive.value = newOptionsMenu?.rowKey === message.rowKey;
});
</script>

<template>
  <EsbabblerModelMessageConfirmDeleteDialog :message>
    <template #default="{ isOpen, updateIsOpen }">
      <v-list-item
        :id="message.rowKey"
        :mt="isSameBatch ? undefined : 4"
        py-1="!"
        min-h-auto="!"
        :op="message.isLoading ? 50 : undefined"
        :active="(active || activeReplyRowKey === message.rowKey) && !isOpen"
        @mouseenter="isMessageActive = true"
        @mouseleave="isMessageActive = false"
        @contextmenu.prevent="
          ({ clientX, clientY }: MouseEvent) => {
            optionsMenu = {
              rowKey: message.rowKey,
              target: [clientX, clientY],
            };
          }
        "
      >
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
          <EsbabblerModelMessageReply v-if="message.replyRowKey" :reply-row-key="message.replyRowKey" />
          <template v-if="message.replyRowKey || !isSameBatch">
            <span font-bold>
              {{ creator.name }}
            </span>
            <span pl-2 text-gray text-xs>
              {{ displayCreatedAt }}
            </span>
          </template>
        </v-list-item-title>
        <template v-if="message.isForward">
          <div flex gap-2>
            <div class="bg-border" w-1 h-inherit rd-1 />
            <div flex flex-col>
              <v-list-item-subtitle>
                <span italic>
                  <v-icon icon="mdi-share" />
                  Forwarded
                </span>
              </v-list-item-subtitle>
              <v-list-item-subtitle op-100="!" v-html="messageHtml" />
            </div>
          </div>
        </template>
        <EsbabblerModelMessageEditor
          v-else-if="isUpdateMode"
          :message
          @update:update-mode="(value) => (isUpdateMode = value)"
          @update:delete-mode="updateIsOpen"
        />
        <v-list-item-subtitle v-else op-100="!" v-html="messageHtml" />
        <EsbabblerModelMessageEmojiList :message-row-key="message.rowKey" />
      </v-list-item>
      <div v-if="!message.isLoading" relative z-1>
        <div
          v-show="activeAndNotUpdateMode && !isOpen"
          absolute
          right-0
          :top="isSameBatch ? -9 : -2"
          @mouseenter="isOptionsActive = true"
          @mouseleave="isOptionsActive = false"
        >
          <v-hover #default="{ isHovering, props: hoverProps }">
            <EsbabblerModelMessageOptionsMenu
              :message
              :is-hovering
              :hover-props
              @update:delete-mode="updateIsOpen"
              @update:forward="(rowKey) => (forwardRowKey = rowKey)"
              @update:menu="(value) => (isOptionsChildrenActive = value)"
              @update:reply="(rowKey) => (replyRowKey = rowKey)"
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
  align-self: flex-start;

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

.created-at {
  width: $avatar-width;
}
</style>
