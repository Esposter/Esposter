<script setup lang="ts">
import "emoji-mart-vue-fast/css/emoji-mart.css";
import data from "emoji-mart-vue-fast/data/all.json";
// @ts-ignore
import { EmojiIndex } from "emoji-mart-vue-fast/src/utils/emoji-data";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: { native: string }) => void;
}

const { onEmojiSelect } = defineProps<EmojiPickerProps>();
const emojiIndex = new EmojiIndex(data);
</script>

<template>
  <v-emoji-picker :data="emojiIndex" @select="onEmojiSelect" />
</template>
