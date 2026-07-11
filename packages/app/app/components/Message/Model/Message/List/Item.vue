<script setup lang="ts">
import type { Creator } from "@/models/message/Creator";
import type { MessageEntity } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { MessageComponentMap } from "@/services/message/MessageComponentMap";
import { useMessageStore } from "@/store/message";
import { useScrollStore } from "@/store/message/ui/scroll";
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
const { deletingRowKey, editingRowKey, optionsMenu } = storeToRefs(messageStore);
const scrollStore = useScrollStore();
const { activeRowKey } = storeToRefs(scrollStore);
const isUpdateMode = computed({
  get: () => editingRowKey.value === message.rowKey,
  set: (value) => {
    editingRowKey.value = value ? message.rowKey : undefined;
  },
});
const isHovered = ref(false);
const isOptionsMenuOpen = ref(false);
const isContextMenuTarget = computed(() => optionsMenu.value?.rowKey === message.rowKey);
const isDisabled = computed(() => Boolean(optionsMenu.value) && !isContextMenuTarget.value);
const isDeleting = computed(() => deletingRowKey.value === message.rowKey);
const isActive = computed(
  () =>
    !isDisabled.value &&
    (isHovered.value || isOptionsMenuOpen.value || isContextMenuTarget.value || isUpdateMode.value),
);
// Mounting on demand keeps the heavy options menu tree to a single instance across the whole list
const isOptionsMenuVisible = computed(
  () => !message.isLoading && isActive.value && !isUpdateMode.value && !isDeleting.value,
);
</script>

<template>
  <!-- display: contents keeps both children as direct flex items of the column-reversed list
    while hover tracking spans the message and its overlapping options menu as one region -->
  <div contents @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <component
      :is="MessageComponentMap[message.type]"
      :id="message.rowKey"
      :mt="isSameBatch ? undefined : 4"
      py-1
      min-h-auto
      :op-loading="message.isLoading ? '' : undefined"
      :active="(isActive || activeRowKey === message.rowKey) && !isDeleting"
      :creator
      :is-same-batch
      :message
      @contextmenu.prevent="
        (event: MouseEvent) => {
          optionsMenu = {
            rowKey: message.rowKey,
            target: [event.clientX, event.clientY],
          };
        }
      "
    >
      <MessageModelMessageEditor
        v-if="isUpdateMode"
        :message
        @update:update-mode="isUpdateMode = $event"
        @update:delete-mode="deletingRowKey = message.rowKey"
      />
    </component>
    <div v-if="isOptionsMenuVisible" relative z-1>
      <div right-4 absolute :top="isSameBatch ? -9 : -2">
        <v-hover #default="{ isHovering, props: hoverProps }">
          <MessageModelMessageOptionsMenu
            :message
            :is-hovering
            :hover-props
            @update:menu="isOptionsMenuOpen = $event"
          />
        </v-hover>
      </div>
    </div>
  </div>
</template>
