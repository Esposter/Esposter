<script setup lang="ts">
import type { Emoji } from "@/models/message/emoji/Emoji";
import type { SuggestionProps } from "@tiptap/suggestion";

import { getEmojiShortcode } from "@/services/message/emoji/getEmojiShortcode";
import { getSuggestionListTitle } from "@/services/message/getSuggestionListTitle";
import { SuggestionTrigger } from "@/services/message/SuggestionTrigger";
import { takeOne } from "@esposter/shared";

const { command, items, query } = defineProps<Pick<SuggestionProps<Emoji>, "command" | "items" | "query">>();
const title = computed(() => getSuggestionListTitle("EMOJI", SuggestionTrigger.Emoji, query));
const selectItem = (index: number) => {
  const emoji = takeOne(items, index);
  command(emoji);
};
const { onKeyDown, selectedIndex } = useSuggestionListNavigation(() => items, selectItem);

defineExpose({ onKeyDown });
</script>

<template>
  <MessageModelMessageSuggestionList max-w-80 :is-visible="items.length > 0" :selected-index :title>
    <v-list-item
      v-for="({ character, slug }, index) of items"
      :key="slug"
      :active="selectedIndex === index"
      :ripple="false"
      @click="selectItem(index)"
    >
      <template #prepend>
        <span leading-none mr-2 text-title-large>{{ character }}</span>
      </template>
      <v-list-item-title font-semibold>{{ getEmojiShortcode(slug) }}</v-list-item-title>
    </v-list-item>
  </MessageModelMessageSuggestionList>
</template>
