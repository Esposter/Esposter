<script setup lang="ts">
import type { SettingsType } from "#src/models/message/room/SettingsType";
import type { UiListItem } from "#src/models/ui/UiListItem";

interface Props {
  isOpen: boolean;
  items: UiListItem<SettingsType>[];
  title: string;
}

defineProps<Props>();
const emit = defineEmits<{ select: [settingsType: SettingsType]; "update:isOpen": [isOpen: boolean] }>();
</script>

<template>
  <UiCollapsible :model-value="isOpen" @update:model-value="(value) => emit('update:isOpen', value)">
    <template #title>
      <span text-sm text-muted truncate uppercase>{{ title }}</span>
    </template>
    <UiList :items :label="title" @select="(settingsType) => emit('select', settingsType)" />
  </UiCollapsible>
</template>
