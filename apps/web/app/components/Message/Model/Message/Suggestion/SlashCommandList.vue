<script setup lang="ts">
import type { SlashCommand } from "@/models/message/slashCommands/SlashCommand";
import type { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion";

import { getSuggestionListTitle } from "@/services/message/getSuggestionListTitle";
import { SuggestionTrigger } from "@/services/message/SuggestionTrigger";
import { takeOne } from "@esposter/shared";

const { command, items, query } = defineProps<Pick<SuggestionProps<SlashCommand>, "command" | "items" | "query">>();
// The required/optional split drives three template positions per row, so it is partitioned once per item
// Rather than re-filtered inside the v-for on every keystroke that refilters the list
const commandItems = computed(() =>
  items.map(({ parameters, ...slashCommand }) => ({
    ...slashCommand,
    optionalParameterCount: parameters.filter(({ isRequired }) => !isRequired).length,
    requiredParameters: parameters.filter(({ isRequired }) => isRequired),
  })),
);
const selectItem = (index: number) => {
  const slashCommand = takeOne(items, index);
  command(slashCommand);
};
const { onKeyDown: baseOnKeyDown, selectedIndex } = useSuggestionListNavigation(() => items, selectItem);
const onKeyDown = ({ event }: Pick<SuggestionKeyDownProps, "event">) => {
  if (event.key === " ") {
    const matchedItemIndex = items.findIndex(
      (item) => item.title.toLowerCase() === query.toLowerCase() || item.type.toLowerCase() === query.toLowerCase(),
    );
    if (matchedItemIndex !== -1) {
      event.preventDefault();
      selectItem(matchedItemIndex);
      return true;
    }
  }

  return baseOnKeyDown({ event });
};

defineExpose({ onKeyDown });
</script>

<template>
  <MessageModelMessageSuggestionList
    max-w-120
    :is-visible="items.length > 0"
    :selected-index
    :title="getSuggestionListTitle(SuggestionTrigger.SlashCommand, query)"
  >
    <!-- eslint-disable-next-line vuejs-accessibility/interactive-supports-focus -- focus stays in the editor, which walks the options -->
    <div
      v-for="(
        { description, icon, optionalParameterCount, requiredParameters, title: commandTitle, type }, index
      ) of commandItems"
      :key="type"
      :aria-selected="selectedIndex === index"
      role="option"
      ui-item
      @click="selectItem(index)"
      @mousedown.prevent
    >
      <UiItemContent :description :icon :title="commandTitle">
        <template #append>
          <UiChip v-for="{ name } of requiredParameters" :key="name">{{ name }}</UiChip>
          <span v-if="optionalParameterCount > 0" text-sm text-muted text-nowrap>
            +{{ optionalParameterCount }} optional
          </span>
        </template>
      </UiItemContent>
    </div>
  </MessageModelMessageSuggestionList>
</template>
