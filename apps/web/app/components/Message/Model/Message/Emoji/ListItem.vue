<script setup lang="ts">
import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { authClient } from "@/services/auth/authClient";
import { useMessageDialogStore } from "@/store/message/dialog";
import { useEmojiStore } from "@/store/message/emoji";
import { mergeProps } from "vue";

interface Props {
  emoji: MessageEmojiMetadataEntity;
}

const { emoji } = defineProps<Props>();
// Rendered inside a `v-for`, so the bare form keeps this component synchronous rather than suspending the list
const session = authClient.useSession();
const messageDialogStore = useMessageDialogStore();
const { reactionsRoomId, reactionsRowKey } = storeToRefs(messageDialogStore);
const emojiStore = useEmojiStore();
const { toggleEmoji } = emojiStore;
const { description } = useEmojiTag(() => emoji.emojiTag);
const { getContextMenuProps } = useContextMenu();
const isReacted = computed(() => {
  const userId = session.value.data?.user.id;
  return Boolean(userId && emoji.userIds.includes(userId));
});
// Everyone who reacted is a right-click, long press or menu key away, since the tooltip that names them cannot be
// Clicked through. The gestures stop at the reaction, so the message around it opens nothing of its own
const contextMenuProps = getContextMenuProps(emoji.rowKey, () => [
  {
    meaning: UiIconMeaning.Group,
    onClick: () => {
      reactionsRoomId.value = emoji.partitionKey;
      reactionsRowKey.value = emoji.messageRowKey;
    },
    title: "View Reactions",
  },
]);
</script>

<!-- A reaction is a toggle: pressed while the reader is among those who reacted, and pressing it adds or takes back
     theirs. Its tooltip is Discord's, the emoji large over who reacted with it -->
<template>
  <UiTooltip :label="description">
    <template #default="{ activatorProps }">
      <UiButton
        :="mergeProps(activatorProps, contextMenuProps)"
        :aria-pressed="isReacted"
        :variant="UiButtonVariant.Field"
        ui-pill
        @click="toggleEmoji(emoji)"
        @contextmenu.stop
        @pointerdown.stop
      >
        <MessageModelMessageEmojiTag :emoji-tag="emoji.emojiTag" />
        {{ emoji.userIds.length }}
      </UiButton>
    </template>
    <template #content>
      <MessageModelMessageEmojiListItemHoverCard :emoji />
    </template>
  </UiTooltip>
</template>
