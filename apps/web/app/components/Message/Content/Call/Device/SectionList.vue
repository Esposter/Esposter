<script setup lang="ts">
import type { DeviceSection } from "@/models/message/room/call/DeviceSection";
import type { UiListItem } from "@/models/ui/UiListItem";

import { MediaDeviceKindMetadataMap } from "@/services/message/room/call/MediaDeviceKindMetadataMap";

interface Props {
  sections: DeviceSection[];
}

const { sections } = defineProps<Props>();
const emit = defineEmits<{ select: [kind: MediaDeviceKind, deviceId: string] }>();
// Each kind is a listbox of its own, under its title, holding the device in use as its one selection; a device the
// Browser will not name yet is numbered in its kind
const deviceLists = computed(() =>
  sections.map(({ devices, kind, selectedId, title }) => ({
    items: devices.map<UiListItem<string>>(({ deviceId, label }, index) => ({
      group: title,
      icon: MediaDeviceKindMetadataMap[kind].icon,
      title: label || `${title} ${index + 1}`,
      value: deviceId,
    })),
    kind,
    selectedIds: [selectedId],
    title,
  })),
);
</script>

<template>
  <template v-for="{ items, kind, selectedIds, title } of deviceLists" :key="kind">
    <UiList
      v-if="items.length > 0"
      :model-value="selectedIds"
      :items
      :label="title"
      @select="(deviceId) => emit('select', kind, deviceId)"
    />
    <div v-else flex flex-col>
      <p text-sm text-muted px-2 pt-2>{{ title }}</p>
      <div ui-row>
        <UiItemContent :icon="MediaDeviceKindMetadataMap[kind].icon" title="System default" />
      </div>
    </div>
  </template>
</template>
