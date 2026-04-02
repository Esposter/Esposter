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
  if (event.key === "ArrowUp") {
    selectedIndex.value = (selectedIndex.value + items.length - 1) % items.length;
    return true;
  }

  if (event.key === "ArrowDown") {
    selectedIndex.value = (selectedIndex.value + 1) % items.length;
    return true;
  }

  if (event.key === "Enter") {
    selectItem(selectedIndex.value);
    return true;
  }

  return false;
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
    <v-list density="compact" py-0>
      <v-list-item
        v-for="({ description, icon, title: commandTitle, type }, index) of items"
        :key="type"
        :active="selectedIndex === index"
        :ripple="false"
        @click="selectItem(index)"
      >
        <template #prepend>
          <v-icon :icon size="small" mr-2 />
        </template>
        <v-list-item-title font-semibold>{{ commandTitle }}</v-list-item-title>
        <v-list-item-subtitle>{{ description }}</v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </StyledCard>
</template>
