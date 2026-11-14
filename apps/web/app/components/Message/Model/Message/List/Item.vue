<script setup lang="ts">
import type { ClientMessage } from "@/models/message/ClientMessage";
import type { Creator } from "@/models/message/Creator";

import { MessageDisplayMode } from "@/models/message/MessageDisplayMode";
import { checkIsSameBatch } from "@/services/message/checkIsSameBatch";
import { MessageComponentMap } from "@/services/message/MessageComponentMap";
import { useMessageStore } from "@/store/message";
import { useMessageDialogStore } from "@/store/message/dialog";
import { useAppearanceStore } from "@/store/message/ui/appearance";
import { useScrollStore } from "@/store/message/ui/scroll";
import { useContextMenuStore } from "@/store/ui/contextMenu";

interface Props {
  creator: Creator;
  message: ClientMessage;
  nextMessage?: ClientMessage;
}

const { message, nextMessage } = defineProps<Props>();
const isSameBatch = computed(() => checkIsSameBatch(message, nextMessage));
const appearanceStore = useAppearanceStore();
const { messageDisplayMode } = storeToRefs(appearanceStore);
// Compact mode halves the batch gap and per-message padding so more messages fit on screen
const isCompact = computed(() => messageDisplayMode.value === MessageDisplayMode.Compact);
const messageStore = useMessageStore();
const { contextMenuRequest, editingMessageId, optionsMenuMessageId } = storeToRefs(messageStore);
const contextMenuStore = useContextMenuStore();
const { contextMenu } = storeToRefs(contextMenuStore);
const { checkIsContextMenuOpen, getContextMenuGestureProps } = useContextMenu();
const messageDialogStore = useMessageDialogStore();
const { deletingMessageId } = storeToRefs(messageDialogStore);
const scrollStore = useScrollStore();
const { activeMessageId } = storeToRefs(scrollStore);
const isUpdateMode = computed({
  get: () => editingMessageId.value === message.id,
  set: (value) => {
    editingMessageId.value = value ? message.id : "";
  },
});
const isHovered = ref(false);
const isOptionsMenuOpen = ref(false);
const isMenuTarget = computed(
  () =>
    optionsMenuMessageId.value === message.id ||
    contextMenuRequest.value?.messageId === message.id ||
    checkIsContextMenuOpen(`${message.id}`),
);
const isDisabled = computed(
  () => Boolean(optionsMenuMessageId.value || contextMenuRequest.value || contextMenu.value) && !isMenuTarget.value,
);
const isDeleting = computed(() => deletingMessageId.value === message.id);
// Its items are the options bar's to build, so a message with no bar to mount — sending, being edited or being
// Deleted — asks for no menu
const contextMenuProps = getContextMenuGestureProps((point) => {
  if (message.isLoading || isUpdateMode.value || isDeleting.value) return;
  contextMenuRequest.value = { ...point, messageId: message.id };
});
const isActive = computed(
  () => !isDisabled.value && (isHovered.value || isOptionsMenuOpen.value || isMenuTarget.value || isUpdateMode.value),
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
      :id="message.id"
      :mt="isSameBatch ? undefined : isCompact ? 2 : 4"
      :py="isCompact ? 0.5 : 1"
      :class="message.isLoading ? 'op-loading' : undefined"
      :active="(isActive || activeMessageId === message.id) && !isDeleting"
      :creator
      :is-same-batch
      :message
      :="contextMenuProps"
    >
      <MessageModelMessageEditor
        v-if="isUpdateMode"
        :message
        @update:update-mode="isUpdateMode = $event"
        @update:delete-mode="deletingMessageId = message.id"
      />
    </component>
    <div v-if="isOptionsMenuVisible" relative z-1>
      <MessageModelMessageOptionsMenu
        :message
        right-4
        absolute
        :top="isSameBatch ? -9 : -2"
        @update:menu="isOptionsMenuOpen = $event"
      />
    </div>
  </div>
</template>
