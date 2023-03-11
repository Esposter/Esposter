<script setup lang="ts">
import type { CreateEmojiInput, DeleteEmojiInput, UpdateEmojiInput } from "@/server/trpc/routers/emoji";
import { useEmojiStore } from "@/store/esbabbler/emoji";
// @NOTE: ES Module issue
// eslint-disable-next-line import/default
import nodeEmoji from "node-emoji";

interface MessageEmojiListProps {
  messageRowKey: string;
}

const props = defineProps<MessageEmojiListProps>();
const { messageRowKey } = toRefs(props);
const { $client } = useNuxtApp();
const { data } = useSession();
const { surfaceOpacity80, backgroundOpacity80, border, info, infoOpacity10 } = useColors();
const emojiStore = useEmojiStore();
const { getEmojiList, createEmoji, updateEmoji, deleteEmoji } = emojiStore;
const emojis = computed(() =>
  getEmojiList(messageRowKey.value).map((e) => ({
    partitionKey: e.partitionKey,
    rowKey: e.rowKey,
    emojiTag: e.emojiTag,
    userIds: e.userIds,
    emoji: nodeEmoji.emojify(e.emojiTag),
    isReacted: Boolean(data.value && e.userIds.includes(data.value.user.id)),
  }))
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
  const isSuccessful = await $client.emoji.deleteEmoji.mutate(input);
  if (isSuccessful) deleteEmoji(input);
};
</script>

<template>
  <div v-if="hasEmojis" mt="2" display="flex" flex="wrap" gap="1">
    <div
      v-for="{ partitionKey, rowKey, emojiTag, userIds, isReacted, emoji } in emojis"
      :key="rowKey"
      :class="isReacted ? 'reacted' : 'not-reacted'"
      w="fit"
      px="2"
      display="flex"
      items="center"
      rd="full!"
      shadow="md"
      cursor="pointer"
      z="1"
      @click="
        isReacted
          ? onDeleteEmoji({ partitionKey, rowKey, messageRowKey })
          : userIds.length > 0
          ? onUpdateEmoji({ partitionKey, rowKey, messageRowKey, userIds })
          : onCreateEmoji({ partitionKey, messageRowKey, emojiTag })
      "
    >
      {{ emoji }}
      <span class="text-subtitle-2" pl="1">{{ userIds.length }}</span>
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
