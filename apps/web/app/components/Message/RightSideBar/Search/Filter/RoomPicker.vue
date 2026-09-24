<script setup lang="ts">
import type { UiListItem } from "@/models/ui/UiListItem";
import type { SerializableValue } from "@esposter/azure";

import { useRoomStore } from "@/store/message/room";

const emit = defineEmits<{ select: [value: SerializableValue] }>();
const { readMoreRooms, readRooms } = await useReadRooms();
const { isPending } = await readRooms();
const roomStore = useRoomStore();
const { hasMore, rooms } = storeToRefs(roomStore);
const items = computed(() =>
  rooms.value.map<UiListItem<string>>(({ id, image, name }) => ({ image: image ?? "", title: name, value: id })),
);
</script>

<template>
  <MessageRightSideBarSearchFilterPickerList :has-more :is-pending @read-more="readMoreRooms">
    <UiList :items label="Rooms" @select="emit('select', $event)" />
  </MessageRightSideBarSearchFilterPickerList>
</template>
