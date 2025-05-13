<script setup lang="ts">
import type { User } from "#shared/db/schema/users";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { dayjs } from "#shared/services/dayjs";
import { useEsbabblerStore } from "@/store/esbabbler";
import { useForwardStore } from "@/store/esbabbler/forward";
import { useReplyStore } from "@/store/esbabbler/reply";

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
          @update:update-mode="(value) => (isUpdateMode = value)"
          @update:delete-mode="updateIsOpen"
        />
      </EsbabblerModelMessage>
      <div v-if="!message.isLoading" relative z-1>
        <div
          v-show="activeAndNotUpdateMode && !isOpen"
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
      <EsbabblerModelMessage :creator is-preview :message :next-message />
    </template>
  </EsbabblerModelMessageConfirmDeleteDialog>
</template>
