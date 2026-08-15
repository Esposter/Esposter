<script setup lang="ts">
import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";

import { authClient } from "@/services/auth/authClient";
import { emojify } from "@/services/message/emoji/emojify";
import { useEmojiStore } from "@/store/message/emoji";

interface MessageEmojiListItemProps {
  emoji: MessageEmojiMetadataEntity;
}

const { emoji } = defineProps<MessageEmojiListItemProps>();
// Rendered inside a `v-for`, so the bare form keeps this component synchronous rather than suspending the list
const session = authClient.useSession();
const emojiStore = useEmojiStore();
const { deleteEmoji, updateEmoji } = emojiStore;
// Reacting again removes this user's own reaction; the last one to leave takes the reaction itself with it
const isReacted = computed(() => {
  const userId = session.value.data?.user.id;
  return Boolean(userId && emoji.userIds.includes(userId));
});
</script>

<template>
  <div
    :class="
      isReacted
        ? ['bg-info-opacity-10', 'b-info']
        : ['bg-background-opacity-80', 'b-transparent', 'hover:bg-surface-opacity-80', 'hover:b-border']
    "
    px-2
    b-1
    rd-full
    b-solid
    flex
    w-fit
    cursor-pointer
    shadow-md
    origin-center
    items-center
    z-1
    active:scale-95
    @click="
      isReacted && emoji.userIds.length === 1
        ? deleteEmoji({
            messageRowKey: emoji.messageRowKey,
            partitionKey: emoji.partitionKey,
            rowKey: emoji.rowKey,
          })
        : updateEmoji({
            messageRowKey: emoji.messageRowKey,
            partitionKey: emoji.partitionKey,
            rowKey: emoji.rowKey,
            userIds: emoji.userIds,
          })
    "
  >
    {{ emojify(emoji.emojiTag) }}
    <span pl-1 text-title-small>{{ emoji.userIds.length }}</span>
  </div>
</template>
