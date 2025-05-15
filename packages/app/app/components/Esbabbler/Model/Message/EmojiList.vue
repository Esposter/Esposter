<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { useEmojiStore } from "@/store/esbabbler/emoji";
import { emojify } from "node-emoji";

interface MessageEmojiListProps {
  messageRowKey: string;
}

const { messageRowKey } = defineProps<MessageEmojiListProps>();
const { data: session } = await authClient.useSession(useFetch);
const { $trpc } = useNuxtApp();
const { backgroundOpacity80, border, info, infoOpacity10, surfaceOpacity80 } = useColors();
const emojiStore = useEmojiStore();
const { getEmojis } = emojiStore;
const emojis = computed(() =>
  getEmojis(messageRowKey).map(({ emojiTag, partitionKey, rowKey, userIds }) => ({
    emoji: emojify(emojiTag),
    emojiTag,
    isReacted: Boolean(session.value && userIds.includes(session.value.user.id)),
    partitionKey,
    rowKey,
    userIds,
  })),
);
const hasEmojis = computed(() => emojis.value.length > 0);
</script>

<template>
  <div v-if="hasEmojis" flex gap-1 mt-2 flex-wrap>
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
          ? $trpc.emoji.deleteEmoji.mutate({ partitionKey, rowKey, messageRowKey })
          : userIds.length > 0
            ? $trpc.emoji.updateEmoji.mutate({ partitionKey, rowKey, messageRowKey, userIds })
            : $trpc.emoji.createEmoji.mutate({ partitionKey, messageRowKey, emojiTag })
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
  border: $border-width-root $border-style-root v-bind(info);
}

.not-reacted {
  background-color: v-bind(backgroundOpacity80);
  border: $border-width-root $border-style-root transparent;

  &:hover {
    background-color: v-bind(surfaceOpacity80);
    border: $border-width-root $border-style-root v-bind(border);
  }
}
</style>
