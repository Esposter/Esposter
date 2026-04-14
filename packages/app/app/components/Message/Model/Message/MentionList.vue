<script setup lang="ts">
import type { MentionNodeAttributes } from "@/models/message/MentionNodeAttributes";
import type { SpecialMentionItem } from "@/models/message/SpecialMentionItem";
import type { User } from "@esposter/db-schema";
import type { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion";

import { takeOne } from "@esposter/shared";

const { command, items, query } = defineProps<SuggestionProps<SpecialMentionItem | User, MentionNodeAttributes>>();
const title = computed(() => {
  const title = "MEMBERS";
  return query ? `${title} MATCHING @${query}` : title;
});
const selectedIndex = ref(0);
const selectItem = (index: number) => {
  const item = takeOne(items, index);
  command({ id: item.id, label: item.name });
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

watch(
  () => items,
  () => {
    selectedIndex.value = 0;
  },
);

defineExpose({ onKeyDown });
</script>

<template>
  <StyledCard v-if="items.length > 0" overflow-y-auto :card-props="{ maxHeight: '250', width: '400' }" :elevation="1">
    <v-card-title text-sm font-bold>{{ title }}</v-card-title>
    <StyledList :selected-index :list-props="{ density: 'compact' }" py-0>
      <v-list-item
        v-for="({ id, image, name }, index) of items"
        :key="id"
        :active="selectedIndex === index"
        :ripple="false"
        @click="selectItem(index)"
      >
        <template #prepend>
          <MessageModelMemberStatusAvatar v-if="image" :id :image :name :avatar-props="{ size: 'x-small' }" />
          <v-avatar v-else size="x-small">
            <v-icon>mdi-at</v-icon>
          </v-avatar>
        </template>
        <v-list-item-title font-semibold>{{ name }}</v-list-item-title>
      </v-list-item>
    </StyledList>
  </StyledCard>
</template>
