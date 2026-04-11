<script setup lang="ts">
import type { SlashCommand } from "@/models/message/slashCommands/SlashCommand";
import type { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion";

import { takeOne } from "@esposter/shared";

const { command, items, query } = defineProps<SuggestionProps<SlashCommand>>();
const title = computed(() => {
  const baseTitle = "COMMANDS";
  return query ? `${baseTitle} MATCHING /${query}` : baseTitle;
});
const selectedIndex = ref(0);
const selectItem = (index: number) => {
  const slashCommand = takeOne(items, index);
  command(slashCommand);
};
const onKeyDown = ({ event }: SuggestionKeyDownProps) => {
  switch (event.key) {
    case "ArrowDown":
      selectedIndex.value = (selectedIndex.value + 1) % items.length;
      return true;
    case "ArrowUp":
      selectedIndex.value = (selectedIndex.value + items.length - 1) % items.length;
      return true;
    case "Enter":
      selectItem(selectedIndex.value);
      return true;
    default:
      return false;
  }
};

defineExpose({ onKeyDown });

watch(
  () => items,
  () => {
    selectedIndex.value = 0;
  },
);
</script>

<template>
  <StyledCard v-if="items.length > 0" overflow-y-auto :card-props="{ maxHeight: '250', width: '400' }" :elevation="1">
    <v-card-title text-sm font-bold>{{ title }}</v-card-title>
    <StyledList :selected-index :list-props="{ density: 'compact' }" py-0>
      <v-list-item
        v-for="({ description, icon, parameters, title: commandTitle, type }, index) of items"
        :key="type"
        :active="selectedIndex === index"
        :ripple="false"
        @click="selectItem(index)"
      >
        <template #prepend>
          <v-icon :icon size="small" mr-2 />
        </template>
        <v-list-item-title flex items-center gap-1 font-semibold>
          {{ commandTitle }}
          <v-chip
            v-for="{ name } of parameters.filter(({ isRequired }) => isRequired)"
            :key="name"
            size="x-small"
            label
          >
            {{ name }}
          </v-chip>
          <v-chip
            v-if="parameters.filter(({ isRequired }) => !isRequired).length > 0"
            size="x-small"
            label
            variant="outlined"
          >
            +{{ parameters.filter(({ isRequired }) => !isRequired).length }} optional
          </v-chip>
        </v-list-item-title>
        <v-list-item-subtitle>{{ description }}</v-list-item-subtitle>
      </v-list-item>
    </StyledList>
  </StyledCard>
</template>
