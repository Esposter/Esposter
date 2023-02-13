<script setup lang="ts">
import { useEmojiStore } from "@/store/chat/useEmojiStore";

interface MessageReactionListProps {
  messageRowKey: string;
}

const props = defineProps<MessageReactionListProps>();
const { messageRowKey } = toRefs(props);
const emojiStore = useEmojiStore();
const { getEmojiList } = emojiStore;
const emojis = computed(() => getEmojiList(messageRowKey.value));
</script>

<template>
  <v-list>
    <v-list-item v-for="emoji in emojis" :key="emoji.rowKey">
      {{ emoji }}
    </v-list-item>
  </v-list>
</template>
