<script setup lang="ts">
import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";
import type { BroadcastMentionItem } from "@/models/message/BroadcastMentionItem";
import type { MentionNodeAttributes } from "@/models/message/MentionNodeAttributes";
import type { RoleMentionItem } from "@/models/message/RoleMentionItem";
import type { SuggestionProps } from "@tiptap/suggestion";

import { SuggestionTrigger } from "@/models/shared/SuggestionTrigger";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getSuggestionListTitle } from "@/services/message/getSuggestionListTitle";
import { getMemberDescription } from "@/services/message/member/getMemberDescription";
import { MentionType, takeOne } from "@esposter/shared";

type MentionItem = BroadcastMentionItem | MemberInRoom | RoleMentionItem;

const { command, items, query } =
  defineProps<Pick<SuggestionProps<MentionItem, MentionNodeAttributes>, "command" | "items" | "query">>();
const checkIsRoleMentionItem = (item: MentionItem): item is RoleMentionItem =>
  "type" in item && item.type === MentionType.Role;
const checkIsMemberMentionItem = (item: MentionItem): item is MemberInRoom => "displayName" in item;
// A member is named by the room's display name, with the account name beside it only where the room shows another
const getItemTitle = (item: MentionItem) => (checkIsMemberMentionItem(item) ? item.displayName : item.name);
const getItemDescription = (item: MentionItem) =>
  checkIsMemberMentionItem(item) ? getMemberDescription(item, "") : undefined;
const selectItem = (index: number) => {
  const item = takeOne(items, index);
  const mentionNodeAttributes: MentionNodeAttributes = { id: item.id, label: getItemTitle(item) };
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
    :title="getSuggestionListTitle('MEMBERS', SuggestionTrigger.Mention, query)"
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
      <UiItemContent
        v-else-if="'image' in item && item.image"
        :description="getItemDescription(item)"
        :title="getItemTitle(item)"
      >
        <template #mark>
          <MessageModelMemberStatusAvatar :id="item.id" :image="item.image" :name="getItemTitle(item)" is-small />
        </template>
      </UiItemContent>
      <UiItemContent
        v-else
        :description="getItemDescription(item)"
        :meaning="UiIconMeaning.Mention"
        :title="getItemTitle(item)"
      />
    </div>
  </MessageModelMessageSuggestionList>
</template>
