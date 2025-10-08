<script setup lang="ts">
import type { MentionNodeAttributes } from "@/models/message/MentionNodeAttributes";
import type { User } from "@esposter/db";
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
        v-for="({ id, image, name }, index) of items"
        :key="id"
        :active="selectedIndex === index"
        :ripple="false"
        @click="selectItem(index)"
      >
        <template #prepend>
          <MessageModelMemberStatusAvatar :id :image :name :avatar-props="{ size: 'x-small' }" />
        </template>
        <v-list-item-title font-semibold>{{ name }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </StyledCard>
</template>
