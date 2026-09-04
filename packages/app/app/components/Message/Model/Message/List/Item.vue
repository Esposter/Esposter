<script setup lang="ts">
import type { Creator } from "@/models/message/Creator";
import type { MessageEntity } from "@esposter/db-schema";

import { MessageDisplayMode } from "@/models/message/MessageDisplayMode";
import { MessageComponentMap } from "@/services/message/MessageComponentMap";
import { useMessageStore } from "@/store/message";
import { useMessageDialogStore } from "@/store/message/dialog";
import { useAppearanceStore } from "@/store/message/ui/appearance";
import { useScrollStore } from "@/store/message/ui/scroll";
import { MessageType } from "@esposter/db-schema";

interface Props {
  creator: Creator;
  message: MessageEntity;
  nextMessage?: MessageEntity;
}

// Consecutive messages from the same author within this window render as one batch — one avatar, one header
const SAME_BATCH_WINDOW_MS = Temporal.Duration.from({ minutes: 5 }).total("milliseconds");

const { creator, message, nextMessage } = defineProps<Props>();
const isSameBatch = computed(
  () =>
    nextMessage &&
    ((message.type === MessageType.Webhook &&
      nextMessage.type === MessageType.Webhook &&
      message.appUser.id === nextMessage.appUser.id) ||
      message.userId === nextMessage.userId) &&
    message.createdAt.getTime() - nextMessage.createdAt.getTime() <= SAME_BATCH_WINDOW_MS,
);
const appearanceStore = useAppearanceStore();
const { messageDisplayMode } = storeToRefs(appearanceStore);
// Compact mode halves the batch gap and per-message padding so more messages fit on screen
const isCompact = computed(() => messageDisplayMode.value === MessageDisplayMode.Compact);
const messageStore = useMessageStore();
const { editingRowKey, optionsMenu } = storeToRefs(messageStore);
const messageDialogStore = useMessageDialogStore();
const { deletingRowKey } = storeToRefs(messageDialogStore);
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
      :mt="isSameBatch ? undefined : isCompact ? 2 : 4"
      :py="isCompact ? 0.5 : 1"
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
