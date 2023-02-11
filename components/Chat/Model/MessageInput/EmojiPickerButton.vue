<script setup lang="ts">
import { useMessageInputStore } from "@/store/chat/useMessageInputStore";

const messageInputStore = useMessageInputStore();
const { updateMessageInput } = messageInputStore;
const { messageInput } = $(storeToRefs(messageInputStore));
</script>

<template>
  <EmojiPicker
    :tooltip-props="{ text: 'Choose an emoji' }"
    :button-props="{ size: 'small' }"
    :button-attrs="{ bg: 'transparent!' }"
    @select="(emoji) => updateMessageInput(`${messageInput}${emoji}`)"
  />
</template>
