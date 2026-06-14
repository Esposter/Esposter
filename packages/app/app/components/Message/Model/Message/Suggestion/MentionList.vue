<script setup lang="ts">
import type { BroadcastMentionItem } from "@/models/message/BroadcastMentionItem";
import type { MentionNodeAttributes } from "@/models/message/MentionNodeAttributes";
import type { RoleMentionItem } from "@/models/message/RoleMentionItem";
import type { User } from "@esposter/db-schema";
import type { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion";

import { SuggestionTrigger } from "@/services/message/SuggestionTrigger";
import { MentionType, takeOne } from "@esposter/shared";

const { command, items, query } =
  defineProps<SuggestionProps<BroadcastMentionItem | RoleMentionItem | User, MentionNodeAttributes>>();
const title = computed(() => {
  const title = "MEMBERS";
  return query ? `${title} MATCHING ${SuggestionTrigger.Mention}${query}` : title;
});
const selectedIndex = ref(0);
const isRoleMentionItem = (item: BroadcastMentionItem | RoleMentionItem | User): item is RoleMentionItem =>
  "type" in item && item.type === MentionType.Role;
const selectItem = (index: number) => {
  const item = takeOne(items, index);
  const mentionNodeAttributes: MentionNodeAttributes = { id: item.id, label: item.name };
  if (isRoleMentionItem(item)) mentionNodeAttributes.type = item.type;
  command(mentionNodeAttributes);
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
  <StyledCard v-show="items.length > 0" overflow-y-auto :card-props="{ maxHeight: 250, width: 400 }" :elevation="1">
    <v-card-title font-bold text-title-small>{{ title }}</v-card-title>
    <StyledList :selected-index :list-props="{ density: 'compact' }" py-0>
      <v-list-item
        v-for="(item, index) of items"
        :key="item.id"
        :active="selectedIndex === index"
        :ripple="false"
        @click="selectItem(index)"
      >
        <template #prepend>
          <v-avatar v-if="isRoleMentionItem(item)" size="x-small">
            <v-icon :color="item.color || undefined">mdi-circle</v-icon>
          </v-avatar>
          <MessageModelMemberStatusAvatar
            v-else-if="'image' in item && item.image"
            :id="item.id"
            :image="item.image"
            :name="item.name"
            :avatar-props="{ size: 'x-small' }"
          />
          <v-avatar v-else size="x-small">
            <v-icon>mdi-at</v-icon>
          </v-avatar>
        </template>
        <v-list-item-title font-semibold>{{ item.name }}</v-list-item-title>
      </v-list-item>
    </StyledList>
  </StyledCard>
</template>
