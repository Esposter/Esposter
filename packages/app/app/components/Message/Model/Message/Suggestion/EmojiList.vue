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
  <v-sheet v-show="items.length > 0" b-1 rd flex flex-col max-h-64 max-w-80 overflow-y-auto elevation-1>
    <v-card-title font-bold text-title-small>{{ title }}</v-card-title>
    <StyledList :selected-index :list-props="{ density: 'compact' }" py-0>
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
    </StyledList>
  </v-sheet>
</template>
