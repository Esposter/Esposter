<script setup lang="ts">
import "emoji-mart-vue-fast/css/emoji-mart.css";
import data from "emoji-mart-vue-fast/data/all.json";
// @ts-ignore
import { EmojiIndex, Picker } from "emoji-mart-vue-fast/src";

const emojiIndex = new EmojiIndex(data);
</script>

<template>
  <Picker :data="emojiIndex" />
</template>
