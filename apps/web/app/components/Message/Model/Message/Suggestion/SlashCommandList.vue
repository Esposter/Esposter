<script setup lang="ts">
import type { SlashCommand } from "#src/models/message/slashCommands/SlashCommand";
import type { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion";

import { SuggestionTrigger } from "#src/models/shared/SuggestionTrigger";
import { getSuggestionListTitle } from "#src/services/message/getSuggestionListTitle";
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
    const normalizedQuery = query.toLowerCase();
    const matchedItemIndex = items.findIndex(
      (item) => item.title.toLowerCase() === normalizedQuery || item.type.toLowerCase() === normalizedQuery,
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
    :title="getSuggestionListTitle('COMMANDS', SuggestionTrigger.Slash, query)"
  >
    <MessageModelMessageSuggestionOption
      v-for="(
        { description, icon, optionalParameterCount, requiredParameters, title: commandTitle, type }, index
      ) of commandItems"
      :key="type"
      :is-selected="selectedIndex === index"
      @select="selectItem(index)"
    >
      <UiItemContent :description :icon :title="commandTitle">
        <template #append>
          <UiChip v-for="{ name } of requiredParameters" :key="name">{{ name }}</UiChip>
          <span v-if="optionalParameterCount > 0" text-sm text-muted text-nowrap>
            +{{ optionalParameterCount }} optional
          </span>
        </template>
      </UiItemContent>
    </MessageModelMessageSuggestionOption>
  </MessageModelMessageSuggestionList>
</template>
