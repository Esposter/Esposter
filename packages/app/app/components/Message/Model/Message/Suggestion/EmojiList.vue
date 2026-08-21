<script setup lang="ts">
import type { PickableEmoji } from "@/models/message/emoji/PickableEmoji";
import type { SuggestionProps } from "@tiptap/suggestion";

import { getEmojiShortcode } from "@/services/message/emoji/getEmojiShortcode";
import { getSuggestionListTitle } from "@/services/message/getSuggestionListTitle";
import { SuggestionTrigger } from "@/services/message/SuggestionTrigger";
import { useEmojiPickerStore } from "@/store/message/emojiPicker";
import { takeOne } from "@esposter/shared";

const { command, items, query } = defineProps<Pick<SuggestionProps<PickableEmoji>, "command" | "items" | "query">>();
const emojiPickerStore = useEmojiPickerStore();
const { skinTone } = storeToRefs(emojiPickerStore);
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
      v-for="(emoji, index) of items"
      :key="emoji.slug"
      :active="selectedIndex === index"
      :ripple="false"
      @click="selectItem(index)"
    >
      <template #prepend>
        <span leading-none mr-2 text-title-large><StyledEmoji :emoji :skin-tone /></span>
      </template>
      <v-list-item-title font-semibold>{{ getEmojiShortcode(emoji.slug) }}</v-list-item-title>
    </v-list-item>
  </MessageModelMessageSuggestionList>
</template>
