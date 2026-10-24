<script setup lang="ts">
import type { SuggestionProps } from "@tiptap/suggestion";

import { getSuggestionListTitle } from "@/services/message/getSuggestionListTitle";
import { SuggestionTrigger } from "@/services/message/SuggestionTrigger";
import { takeOne } from "@esposter/shared";

const { command, items, query } = defineProps<Pick<SuggestionProps<string>, "command" | "items" | "query">>();
const selectItem = (index: number) => {
  command(takeOne(items, index));
};
const { onKeyDown, selectedIndex } = useSuggestionListNavigation(() => items, selectItem);

defineExpose({ onKeyDown });
</script>

<template>
  <MessageModelMessageSuggestionList
    max-w-120
    :is-visible="items.length > 0"
    :selected-index
    :title="getSuggestionListTitle('MERGE FIELDS', SuggestionTrigger.MergeField, query)"
  >
    <!-- eslint-disable-next-line vuejs-accessibility/interactive-supports-focus -- focus stays in the editor, which walks the options -->
    <div
      v-for="(column, index) of items"
      :key="column"
      :aria-selected="selectedIndex === index"
      role="option"
      ui-item
      @click="selectItem(index)"
      @mousedown.prevent
    >
      <UiItemContent :title="column" />
    </div>
  </MessageModelMessageSuggestionList>
</template>
