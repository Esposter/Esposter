<script setup lang="ts">
import type { CreateEmojiInput, DeleteEmojiInput, UpdateEmojiInput } from "@/server/trpc/routers/emoji";
import { useEmojiStore } from "@/store/esbabbler/emoji";
import { emojify } from "node-emoji";

interface MessageEmojiListProps {
  messageRowKey: string;
}

const { messageRowKey } = defineProps<MessageEmojiListProps>();
const { $client } = useNuxtApp();
const { session } = useAuth();
const { surfaceOpacity80, backgroundOpacity80, border, info, infoOpacity10 } = useColors();
const emojiStore = useEmojiStore();
const { getEmojiList, createEmoji, updateEmoji, deleteEmoji } = emojiStore;
const emojis = computed(() =>
  getEmojiList(messageRowKey).map((e) => ({
    partitionKey: e.partitionKey,
    rowKey: e.rowKey,
    emojiTag: e.emojiTag,
    userIds: e.userIds,
    emoji: emojify(e.emojiTag),
    isReacted: Boolean(session.value && e.userIds.includes(session.value.user.id)),
  })),
);
const hasEmojis = computed(() => emojis.value.length > 0);
const onCreateEmoji = async (input: CreateEmojiInput) => {
  const newEmoji = await $client.emoji.createEmoji.mutate(input);
  if (newEmoji) createEmoji(newEmoji);
};
const onUpdateEmoji = async (input: UpdateEmojiInput) => {
  const updatedEmoji = await $client.emoji.updateEmoji.mutate(input);
  if (updatedEmoji) updateEmoji(updatedEmoji);
};
const onDeleteEmoji = async (input: DeleteEmojiInput) => {
  await $client.emoji.deleteEmoji.mutate(input);
  deleteEmoji(input);
};
</script>

<template>
  <div v-if="hasEmojis" mt-2 flex flex-wrap gap-1>
    <div
      v-for="{ partitionKey, rowKey, emojiTag, userIds, isReacted, emoji } in emojis"
      :key="rowKey"
      :class="isReacted ? 'reacted' : 'not-reacted'"
      w-fit
      px-2
      flex
      items-center
      rd-full="!"
      shadow-md
      cursor-pointer
      z-1
      @click="
        isReacted
          ? onDeleteEmoji({ partitionKey, rowKey, messageRowKey })
          : userIds.length > 0
          ? onUpdateEmoji({ partitionKey, rowKey, messageRowKey, userIds })
          : onCreateEmoji({ partitionKey, messageRowKey, emojiTag })
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
  border: 1px solid v-bind(info);

  &:active {
    transform: $clickShrink;
  }
}

.not-reacted {
  background-color: v-bind(backgroundOpacity80);
  border: 1px solid transparent;

  &:hover {
    background-color: v-bind(surfaceOpacity80);
    border: 1px solid v-bind(border);
  }

  &:active {
    transform: $clickShrink;
  }
}
</style>
