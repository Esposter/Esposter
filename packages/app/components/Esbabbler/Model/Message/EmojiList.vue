<script setup lang="ts">
import { useEmojiStore } from "@/store/esbabbler/emoji";
import { emojify } from "node-emoji";

interface MessageEmojiListProps {
  messageRowKey: string;
}

const { messageRowKey } = defineProps<MessageEmojiListProps>();
const { session } = useAuth();
const { backgroundOpacity80, border, info, infoOpacity10, surfaceOpacity80 } = useColors();
const emojiStore = useEmojiStore();
const { createEmoji, deleteEmoji, getEmojiList, updateEmoji } = emojiStore;
const emojis = computed(() =>
  getEmojiList(messageRowKey).map((e) => ({
    emoji: emojify(e.emojiTag),
    emojiTag: e.emojiTag,
    isReacted: Boolean(session.value && e.userIds.includes(session.value.user.id)),
    partitionKey: e.partitionKey,
    rowKey: e.rowKey,
    userIds: e.userIds,
  })),
);
const hasEmojis = computed(() => emojis.value.length > 0);
</script>

<template>
  <div v-if="hasEmojis" flex mt-2 flex-wrap gap-1>
    <div
      v-for="{ partitionKey, rowKey, emojiTag, userIds, isReacted, emoji } of emojis"
      :key="rowKey"
      :class="isReacted ? 'reacted' : 'not-reacted'"
      rd-full="!"
      flex
      items-center
      shadow-md
      cursor-pointer
      z-1
      w-fit
      px-2
      origin-center
      active:scale-95
      @click="
        isReacted
          ? deleteEmoji({ partitionKey, rowKey, messageRowKey })
          : userIds.length > 0
            ? updateEmoji({ partitionKey, rowKey, messageRowKey, userIds })
            : createEmoji({ partitionKey, messageRowKey, emojiTag })
      "
    >
      {{ emoji }}
      <span class="text-subtitle-2" pl-1>{{ userIds.length }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.reacted {
  background-color: v-bind(infoOpacity10);
  border: 1px $border-style-root v-bind(info);
}

.not-reacted {
  background-color: v-bind(backgroundOpacity80);
  border: 1px $border-style-root transparent;

  &:hover {
    background-color: v-bind(surfaceOpacity80);
    border: 1px $border-style-root v-bind(border);
  }
}
</style>
