<script setup lang="ts">
import type { BroadcastMentionItem } from "@/models/message/BroadcastMentionItem";
import type { MentionNodeAttributes } from "@/models/message/MentionNodeAttributes";
import type { RoleMentionItem } from "@/models/message/RoleMentionItem";
import type { User } from "@esposter/db-schema";
import type { SuggestionProps } from "@tiptap/suggestion";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getSuggestionListTitle } from "@/services/message/getSuggestionListTitle";
import { SuggestionTrigger } from "@/services/message/SuggestionTrigger";
import { MentionType, takeOne } from "@esposter/shared";

const { command, items, query } =
  defineProps<SuggestionProps<BroadcastMentionItem | RoleMentionItem | User, MentionNodeAttributes>>();
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
  <MessageModelMessageSuggestionList
    w-100
    :is-visible="items.length > 0"
    :selected-index
    :title="getSuggestionListTitle(SuggestionTrigger.Mention, query)"
  >
    <!-- eslint-disable-next-line vuejs-accessibility/interactive-supports-focus -- focus stays in the editor, which walks the options -->
    <div
      v-for="(item, index) of items"
      :key="item.id"
      :aria-selected="selectedIndex === index"
      role="option"
      ui-item
      @click="selectItem(index)"
      @mousedown.prevent
    >
      <UiItemContent v-if="checkIsRoleMentionItem(item)" :title="item.name">
        <!-- A role is marked in its own colour, which its owners chose -->
        <template #mark>
          <span class="i-mdi:circle" :style="{ color: item.color || undefined }" size-6 />
        </template>
      </UiItemContent>
      <UiItemContent v-else-if="'image' in item && item.image" :title="item.name">
        <template #mark>
          <MessageModelMemberStatusAvatar :id="item.id" :image="item.image" :name="item.name" is-small />
        </template>
      </UiItemContent>
      <UiItemContent v-else :meaning="UiIconMeaning.Mention" :title="item.name" />
    </div>
  </MessageModelMessageSuggestionList>
</template>
