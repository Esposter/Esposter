<script setup lang="ts">
import type { BroadcastMentionItem } from "@/models/message/BroadcastMentionItem";
import type { MentionNodeAttributes } from "@/models/message/MentionNodeAttributes";
import type { RoleMentionItem } from "@/models/message/RoleMentionItem";
import type { User } from "@esposter/db-schema";
import type { SuggestionProps } from "@tiptap/suggestion";

import { getSuggestionListTitle } from "@/services/message/getSuggestionListTitle";
import { SuggestionTrigger } from "@/services/message/SuggestionTrigger";
import { MentionType, takeOne } from "@esposter/shared";

const { command, items, query } =
  defineProps<SuggestionProps<BroadcastMentionItem | RoleMentionItem | User, MentionNodeAttributes>>();
const title = computed(() => getSuggestionListTitle("MEMBERS", SuggestionTrigger.Mention, query));
const checkIsRoleMentionItem = (item: BroadcastMentionItem | RoleMentionItem | User): item is RoleMentionItem =>
  "type" in item && item.type === MentionType.Role;
const selectItem = (index: number) => {
  const item = takeOne(items, index);
  const mentionNodeAttributes: MentionNodeAttributes = { id: item.id, label: item.name };
  if (checkIsRoleMentionItem(item)) mentionNodeAttributes.type = item.type;
  command(mentionNodeAttributes);
};
const { onKeyDown, selectedIndex } = useSuggestionListNavigation(() => items, selectItem);

defineExpose({ onKeyDown });
</script>

<template>
  <MessageModelMessageSuggestionList w-100 :is-visible="items.length > 0" :selected-index :title>
    <v-list-item
      v-for="(item, index) of items"
      :key="item.id"
      :active="selectedIndex === index"
      :ripple="false"
      @click="selectItem(index)"
    >
      <template #prepend>
        <v-avatar v-if="checkIsRoleMentionItem(item)" size="x-small">
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
  </MessageModelMessageSuggestionList>
</template>
