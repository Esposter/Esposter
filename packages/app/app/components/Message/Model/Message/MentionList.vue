<script setup lang="ts">
import type { User } from "#shared/db/schema/users";
import type { MentionNodeAttributes } from "@/models/message/MentionNodeAttributes";
import type { SuggestionProps } from "@tiptap/suggestion";

const { command, items, query } = defineProps<SuggestionProps<User, MentionNodeAttributes>>();
const title = computed(() => {
  const title = "MEMBERS";
  return query ? `${title} MATCHING @${query}` : title;
});
const selectedIndex = ref(0);
const selectItem = (index: number) => {
  const item = items[index];
  command({ id: item.id, label: item.name });
};
const onKeyDown = ({ event }: { event: KeyboardEvent }) => {
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

watchDeep(
  () => items,
  () => {
    selectedIndex.value = 0;
  },
);
</script>

<template>
  <StyledCard overflow-y-auto :card-props="{ maxHeight: '250', width: '400' }">
    <v-card-title text-sm font-bold>{{ title }}</v-card-title>
    <v-btn
      v-for="({ id, image, name }, index) of items"
      :key="id"
      w-full
      rd
      justify-start
      :ripple="false"
      @click="selectItem(index)"
    >
      <MessageModelMemberStatusAvatar :id :image :name :avatar-props="{ size: 'x-small' }" />
      <span pl-2 font-semibold>
        {{ name }}
      </span>
    </v-btn>
  </StyledCard>
</template>
