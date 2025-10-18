<script setup lang="ts">
import type { Creator } from "@/models/message/Creator";
import type { MessageEntity } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { MessageComponentMap } from "@/services/message/MessageComponentMap";
import { useMessageStore } from "@/store/message";
import { useForwardStore } from "@/store/message/forward";
import { useReplyStore } from "@/store/message/reply";
import { MessageType } from "@esposter/db-schema";

interface MessageListItemProps {
  creator: Creator;
  message: MessageEntity;
  nextMessage?: MessageEntity;
}

const { creator, message, nextMessage } = defineProps<MessageListItemProps>();
const isSameBatch = computed(
  () =>
    nextMessage &&
    ((message.type === MessageType.Webhook &&
      nextMessage.type === MessageType.Webhook &&
      message.appUser.id === nextMessage.appUser.id) ||
      message.userId === nextMessage.userId) &&
    dayjs(message.createdAt).diff(nextMessage.createdAt, "minutes") <= 5,
);
const messageStore = useMessageStore();
const { optionsMenu } = storeToRefs(messageStore);
const replyStore = useReplyStore();
const { activeRowKey: activeReplyRowKey, rowKey: replyRowKey } = storeToRefs(replyStore);
const forwardStore = useForwardStore();
const { rowKey: forwardRowKey } = storeToRefs(forwardStore);
const isUpdateMode = ref(false);
const isMessageActive = ref(false);
const isOptionsActive = ref(false);
const isOptionsChildrenActive = ref(false);
const isDisabled = computed(() => optionsMenu.value && optionsMenu.value.rowKey !== message.rowKey);
const isActive = computed(
  () =>
    !isDisabled.value &&
    (isMessageActive.value || isOptionsActive.value || isOptionsChildrenActive.value || isUpdateMode.value),
);
const isActiveAndNotUpdateMode = computed(() => isActive.value && !isUpdateMode.value);
const selectEmoji = await useSelectEmoji(message);

watch(optionsMenu, (newOptionsMenu) => {
  isOptionsChildrenActive.value = newOptionsMenu?.rowKey === message.rowKey;
});
</script>

<template>
  <MessageModelMessageConfirmDeleteDialog :message>
    <template #default="{ isOpen, updateIsOpen }">
      <component
        :is="MessageComponentMap[message.type]"
        :id="message.rowKey"
        :mt="isSameBatch ? undefined : 4"
        py-1="!"
        min-h-auto="!"
        :op="message.isLoading ? 50 : undefined"
        :active="(isActive || activeReplyRowKey === message.rowKey) && !isOpen"
        :creator
        :is-same-batch
        :message
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
        <MessageModelMessageEditor
          v-if="isUpdateMode"
          :message
          @update:update-mode="isUpdateMode = $event"
          @update:delete-mode="updateIsOpen"
        />
      </component>
      <div v-if="!message.isLoading" v-show="isActiveAndNotUpdateMode && !isOpen" relative z-1>
        <div
          absolute
          right-4
          :top="isSameBatch ? -9 : -2"
          @mouseenter="isOptionsActive = true"
          @mouseleave="isOptionsActive = false"
        >
          <v-hover #default="{ isHovering, props: hoverProps }">
            <MessageModelMessageConfirmPinDialog :message>
              <template #default="{ updateIsOpen: updatePinDialogIsOpen }">
                <MessageModelMessageOptionsMenu
                  :message
                  :is-hovering
                  :hover-props
                  @update:delete-mode="updateIsOpen"
                  @update:forward="forwardRowKey = $event"
                  @update:menu="isOptionsChildrenActive = $event"
                  @update:pin="updatePinDialogIsOpen"
                  @update:reply="replyRowKey = $event"
                  @update:select-emoji="selectEmoji"
                  @update:update-mode="isUpdateMode = $event"
                />
              </template>
              <template #messagePreview>
                <MessageModelMessageType :creator :message :next-message is-preview />
              </template>
            </MessageModelMessageConfirmPinDialog>
          </v-hover>
        </div>
      </div>
    </template>
    <template #messagePreview>
      <MessageModelMessageType :creator :message :next-message is-preview />
    </template>
  </MessageModelMessageConfirmDeleteDialog>
</template>
