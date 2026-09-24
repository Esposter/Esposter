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
const selectItem = (index: number) => {
  const emoji = takeOne(items, index);
  command(emoji);
};
const { onKeyDown, selectedIndex } = useSuggestionListNavigation(() => items, selectItem);

defineExpose({ onKeyDown });
</script>

<template>
  <MessageModelMessageSuggestionList
    max-w-80
    :is-visible="items.length > 0"
    :selected-index
    :title="getSuggestionListTitle(SuggestionTrigger.Emoji, query)"
  >
    <!-- eslint-disable-next-line vuejs-accessibility/interactive-supports-focus -- focus stays in the editor, which walks the options -->
    <div
      v-for="(emoji, index) of items"
      :key="emoji.slug"
      :aria-selected="selectedIndex === index"
      role="option"
      ui-item
      @click="selectItem(index)"
      @mousedown.prevent
    >
      <UiItemContent :title="getEmojiShortcode(emoji.slug)">
        <template #mark><StyledEmoji :emoji :skin-tone /></template>
      </UiItemContent>
    </div>
  </MessageModelMessageSuggestionList>
</template>
