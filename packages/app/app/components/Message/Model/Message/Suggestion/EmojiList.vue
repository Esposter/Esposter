<script setup lang="ts">
import type { EmojiItem } from "@/models/message/EmojiItem";
import type { SuggestionProps } from "@tiptap/suggestion";

import { getSuggestionListTitle } from "@/services/message/getSuggestionListTitle";
import { SuggestionTrigger } from "@/services/message/SuggestionTrigger";
import { takeOne } from "@esposter/shared";

const { command, items, query } = defineProps<Pick<SuggestionProps<EmojiItem>, "command" | "items" | "query">>();
const title = computed(() => getSuggestionListTitle("EMOJI", SuggestionTrigger.Emoji, query));
const selectItem = (index: number) => {
  const emojiItem = takeOne(items, index);
  command(emojiItem);
};
const { onKeyDown, selectedIndex } = useSuggestionListNavigation(() => items, selectItem);

defineExpose({ onKeyDown });
</script>

<template>
  <MessageModelMessageSuggestionList max-w-80 :is-visible="items.length > 0" :selected-index :title>
    <v-list-item
      v-for="({ emoji, name }, index) of items"
      :key="name"
      :active="selectedIndex === index"
      :ripple="false"
      @click="selectItem(index)"
    >
      <template #prepend>
        <span leading-none mr-2 text-title-large>{{ emoji }}</span>
      </template>
      <v-list-item-title font-semibold
        >{{ SuggestionTrigger.Emoji }}{{ name }}{{ SuggestionTrigger.Emoji }}</v-list-item-title
      >
    </v-list-item>
  </MessageModelMessageSuggestionList>
</template>
