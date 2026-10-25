<script setup lang="ts">
import type { NoteSlashItem } from "@/models/resource/note/NoteSlashItem";
import type { SuggestionProps } from "@tiptap/suggestion";

import { SuggestionTrigger } from "@/models/shared/SuggestionTrigger";
import { getSuggestionListTitle } from "@/services/message/getSuggestionListTitle";
import { takeOne } from "@esposter/shared";

const { command, items, query } = defineProps<Pick<SuggestionProps<NoteSlashItem>, "command" | "items" | "query">>();
const selectItem = (index: number) => {
  const item = takeOne(items, index);
  command(item);
};
const { onKeyDown, selectedIndex } = useSuggestionListNavigation(() => items, selectItem);

defineExpose({ onKeyDown });
</script>

<template>
  <MessageModelMessageSuggestionList
    max-w-120
    :is-visible="items.length > 0"
    :selected-index
    :title="getSuggestionListTitle('BLOCKS', SuggestionTrigger.Slash, query)"
  >
    <!-- eslint-disable-next-line vuejs-accessibility/interactive-supports-focus -- focus stays in the editor, which walks the options -->
    <div
      v-for="({ icon, title }, index) of items"
      :key="title"
      :aria-selected="selectedIndex === index"
      role="option"
      ui-item
      @click="selectItem(index)"
      @mousedown.prevent
    >
      <UiItemContent :icon :title />
    </div>
  </MessageModelMessageSuggestionList>
</template>
