<script setup lang="ts">
import type { SuggestionProps } from "@tiptap/suggestion";

import { SuggestionTrigger } from "#src/models/shared/SuggestionTrigger";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { getSuggestionListTitle } from "#src/services/message/getSuggestionListTitle";
import { takeOne } from "@esposter/shared";

// @TODO: https://github.com/vuejs/core/issues/11371
interface Props {
  command: SuggestionProps<string>["command"];
  items: SuggestionProps<string>["items"];
  query: SuggestionProps<string>["query"];
}
const { command, items } = defineProps<Props>();
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
    <!-- oxlint-disable a11y/interactive-supports-focus -- focus stays in the editor, which walks the
      options -->
    <div
      v-for="(column, index) of items"
      :key="column"
      :aria-selected="selectedIndex === index"
      role="option"
      ui-item
      @click="selectItem(index)"
      @mousedown.prevent
    >
      <UiItemContent :meaning="UiIconMeaning.Tag" :title="column" />
    </div>
    <!-- oxlint-enable a11y/interactive-supports-focus -->
  </MessageModelMessageSuggestionList>
</template>
