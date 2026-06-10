<script setup lang="ts">
import type { EmojiItem } from "@/models/message/EmojiItem";
import type { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion";

import { SuggestionTrigger } from "@/services/message/SuggestionTrigger";
import { takeOne } from "@esposter/shared";

const { command, items, query } = defineProps<Pick<SuggestionProps<EmojiItem>, "command" | "items" | "query">>();
const title = computed(() => {
  const baseTitle = "EMOJI";
  return query ? `${baseTitle} MATCHING ${SuggestionTrigger.Emoji}${query}` : baseTitle;
});
const selectedIndex = ref(0);
const selectItem = (index: number) => {
  const emojiItem = takeOne(items, index);
  command(emojiItem);
};
const onKeyDown = ({ event }: SuggestionKeyDownProps) => {
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      selectedIndex.value = (selectedIndex.value + 1) % items.length;
      return true;
    case "ArrowUp":
      event.preventDefault();
      selectedIndex.value = (selectedIndex.value + items.length - 1) % items.length;
      return true;
    case "Enter":
      event.preventDefault();
      selectItem(selectedIndex.value);
      return true;
    default:
      return false;
  }
};

watch(
  () => items,
  () => {
    selectedIndex.value = 0;
  },
);

defineExpose({ onKeyDown });
</script>

<template>
  <div v-show="items.length > 0" b-1 rd bg-surface flex flex-col max-h-64 max-w-80 overflow-y-auto elevation-1>
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
  </div>
</template>
