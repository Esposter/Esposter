<script setup lang="ts">
import type { SlashCommand } from "@/models/message/slashCommands/SlashCommand";
import type { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion";

import { getSuggestionListTitle } from "@/services/message/getSuggestionListTitle";
import { SuggestionTrigger } from "@/services/message/SuggestionTrigger";
import { takeOne } from "@esposter/shared";

const { command, items, query } = defineProps<Pick<SuggestionProps<SlashCommand>, "command" | "items" | "query">>();
const title = computed(() => getSuggestionListTitle("COMMANDS", SuggestionTrigger.SlashCommand, query));
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
  <MessageModelMessageSuggestionList max-w-100 :is-visible="items.length > 0" :selected-index :title>
    <v-list-item
      v-for="(
        { description, icon, optionalParameterCount, requiredParameters, title: commandTitle, type }, index
      ) of commandItems"
      :key="type"
      :active="selectedIndex === index"
      :ripple="false"
      @click="selectItem(index)"
    >
      <template #prepend>
        <v-icon :icon size="small" mr-2 />
      </template>
      <v-list-item-title font-semibold flex gap-1 items-center>
        {{ commandTitle }}
        <v-chip v-for="{ name } of requiredParameters" :key="name" size="x-small" label>
          {{ name }}
        </v-chip>
        <v-chip v-if="optionalParameterCount > 0" size="x-small" label variant="outlined">
          +{{ optionalParameterCount }} optional
        </v-chip>
      </v-list-item-title>
      <v-list-item-subtitle>{{ description }}</v-list-item-subtitle>
    </v-list-item>
  </MessageModelMessageSuggestionList>
</template>
