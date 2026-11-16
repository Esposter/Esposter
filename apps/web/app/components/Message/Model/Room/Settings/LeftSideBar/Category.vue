<script setup lang="ts">
import type { SettingsCategory } from "#src/models/message/room/SettingsCategory";
import type { SettingsType } from "#src/models/message/room/SettingsType";
import type { UiListItem } from "#src/models/ui/UiListItem";

interface Props {
  category: SettingsCategory;
  items: UiListItem<SettingsType>[];
  title: string;
}

const openedCategories = defineModel<SettingsCategory[]>({ required: true });
const { category, items, title } = defineProps<Props>();
const emit = defineEmits<{ select: [settingsType: SettingsType] }>();
</script>

<template>
  <UiCollapsible
    :model-value="openedCategories.includes(category)"
    @update:model-value="
      (isOpen) => {
        openedCategories = isOpen
          ? [...openedCategories, category]
          : openedCategories.filter((openedCategory) => openedCategory !== category);
      }
    "
  >
    <template #title>
      <span text-sm text-muted truncate uppercase>{{ title }}</span>
    </template>
    <UiList :items :label="title" @select="(settingsType) => emit('select', settingsType)" />
  </UiCollapsible>
</template>
