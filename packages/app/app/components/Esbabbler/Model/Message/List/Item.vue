<script setup lang="ts">
import type { User } from "#shared/db/schema/users";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { dayjs } from "#shared/services/dayjs";
import { useMessageStore } from "@/store/message";
import { useForwardStore } from "@/store/message/forward";
import { useReplyStore } from "@/store/message/reply";

interface MessageListItemProps {
  creator: User;
  message: MessageEntity;
  nextMessage?: MessageEntity;
}

const { creator, message, nextMessage } = defineProps<MessageListItemProps>();
const isSameBatch = computed(
  () => message.userId === nextMessage?.userId && dayjs(message.createdAt).diff(nextMessage.createdAt, "minutes") <= 5,
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
      <EsbabblerModelMessage
        :id="message.rowKey"
        :mt="isSameBatch ? undefined : 4"
        py-1="!"
        min-h-auto="!"
        :op="message.isLoading ? 50 : undefined"
        :active="(active || activeReplyRowKey === message.rowKey) && !isOpen"
        :creator
        :message
        :next-message
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
        <EsbabblerModelMessageEditor
          v-if="isUpdateMode"
          :message
          @update:update-mode="isUpdateMode = $event"
          @update:delete-mode="updateIsOpen"
        />
      </EsbabblerModelMessage>
      <div v-if="!message.isLoading" v-show="activeAndNotUpdateMode && !isOpen" relative z-1>
        <div
          absolute
          right-4
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
              @update:forward="forwardRowKey = $event"
              @update:menu="isOptionsChildrenActive = $event"
              @update:reply="replyRowKey = $event"
              @update:select-emoji="selectEmoji"
              @update:update-mode="isUpdateMode = $event"
            />
          </v-hover>
        </div>
      </div>
    </template>
    <template #messagePreview>
      <EsbabblerModelMessage :creator :message :next-message is-preview />
    </template>
  </EsbabblerModelMessageConfirmDeleteDialog>
</template>
