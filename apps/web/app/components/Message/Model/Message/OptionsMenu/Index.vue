<script setup lang="ts">
import type { ClientMessage } from "@/models/message/ClientMessage";
import type { Item } from "@/models/shared/Item";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { EmojiMoreMenuItems } from "@/services/message/emoji/EmojiMoreMenuItems";
import { useMessageStore } from "@/store/message";
import { useContextMenuStore } from "@/store/ui/contextMenu";

interface Props {
  message: ClientMessage;
}

const { message } = defineProps<Props>();
const emit = defineEmits<{ "update:menu": [value: boolean] }>();
const isCreator = await useIsCreator(() => message);
const isEditable = computed(() => isCreator.value && !message.isForward);
const { actionMessageItems, deleteMessageItem, updateMessageItems, updateMessageMenuItems } = useMessageActionItems(
  message,
  isEditable,
  isCreator,
);
const selectEmoji = useSelectEmoji(message);
const messageStore = useMessageStore();
const { contextMenuRequest, optionsMenuMessageId } = storeToRefs(messageStore);
const contextMenuStore = useContextMenuStore();
const { openContextMenu } = contextMenuStore;
// The overflow menu's sections, each opening its own group, which a right-click opens as well; reacting stays on the
// Bar itself, one move away
const menuItems = computed(() => {
  const items: Item[] = [];
  for (const [firstItem, ...restItems] of [
    updateMessageMenuItems.value,
    actionMessageItems.value,
    deleteMessageItem.value ? [deleteMessageItem.value] : [],
  ])
    if (firstItem) items.push({ ...firstItem, isGroupStart: true }, ...restItems);
  return items;
});

// The bar mounts over the message a context menu was asked for, and is the one that can say what goes in it
watchImmediate(contextMenuRequest, (newContextMenuRequest) => {
  if (newContextMenuRequest?.messageId !== message.id) return;
  const { messageId, ...point } = newContextMenuRequest;
  contextMenuRequest.value = undefined;
  openContextMenu({ ...point, items: menuItems.value, key: messageId });
});
</script>

<!-- Discord's hover bar: the quick reactions, the picker, the actions a message offers most, and the rest behind More.
     It floats over the message it acts on, so it is lifted rather than framed -->
<template>
  <div aria-label="Message actions" role="group" p-1 flex items-center ui-lifted>
    <MessageModelMessageOptionsMenuReaction
      v-for="emoji of EmojiMoreMenuItems"
      :key="emoji"
      :emoji
      @select="selectEmoji(emoji)"
    />
    <span aria-hidden="true" mx-1 bg-divider h-6 w="[var(--ui-border-width)]" />
    <MessageModelMessageEmojiPicker
      :variant="UiButtonVariant.Quiet"
      @update:is-open="emit('update:menu', $event)"
      @select="(emoji) => selectEmoji(emoji)"
    />
    <MessageModelMessageOptionsMenuItems :items="updateMessageItems" />
    <!-- The bar stays mounted, and holds the other messages still, while its menu is open -->
    <UiOverflowMenu
      :items="menuItems"
      label="More"
      @update:is-open="
        (isOpen) => {
          optionsMenuMessageId = isOpen ? message.id : '';
          emit('update:menu', isOpen);
        }
      "
    />
  </div>
</template>
