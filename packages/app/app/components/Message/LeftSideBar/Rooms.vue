<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";
import { useRoomCategoryStore } from "@/store/message/roomCategory";

const isCollapsed = useLocalStorage("message-sidebar-rooms-collapsed", false);
const { readRoomCategories } = useReadRoomCategories();
const roomCategoryStore = useRoomCategoryStore();
const { categories } = storeToRefs(roomCategoryStore);
const roomStore = useRoomStore();
const { hasMore, rooms } = storeToRefs(roomStore);
const { readMoreRooms, readRooms } = await useReadRooms();
const [{ isPending }] = await Promise.all([readRooms(), readRoomCategories()]);
const roomsByCategoryId = computed(() => {
  const map = new Map<null | string, Room[]>();
  for (const room of rooms.value) {
    const group = map.get(room.categoryId) ?? [];
    group.push(room);
    map.set(room.categoryId, group);
  }
  return map;
});
const uncategorizedRooms = computed(() => roomsByCategoryId.value.get(null) ?? []);
const roomsByCategory = computed(() =>
  categories.value.map((category) => ({
    category,
    rooms: roomsByCategoryId.value.get(category.id) ?? [],
  })),
);
</script>

<template>
  <MessageModelRoomBaseList :has-more :is-collapsed :is-pending @load-more="readMoreRooms">
    <template #prepend>
      <v-list-item font-bold @click="isCollapsed = !isCollapsed">
        Rooms
        <template #append>
          <v-icon :icon="isCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-down'" size="small" />
          <MessageModelRoomCategoryCreateDialogButton />
          <MessageModelRoomCreateButton />
        </template>
      </v-list-item>
    </template>
    <MessageModelRoomCategoryRoomGroup :rooms="uncategorizedRooms" />
    <MessageModelRoomCategoryRoomGroup
      v-for="{ category, rooms: categoryRooms } of roomsByCategory"
      :key="category.id"
      :category
      :rooms="categoryRooms"
    />
  </MessageModelRoomBaseList>
</template>
