<script setup lang="ts">
import { useRoomStore } from "@/store/message/room";
import { useRoomCategoryStore } from "@/store/message/roomCategory";

const isCollapsed = useLocalStorage("message-sidebar-rooms-collapsed", false);
const { readRoomCategories } = useReadRoomCategories();
const roomCategoryStore = useRoomCategoryStore();
const { categories } = storeToRefs(roomCategoryStore);
const roomStore = useRoomStore();
const { hasMore, rooms } = storeToRefs(roomStore);
const { readMoreRooms, readRooms } = useReadRooms();
const [{ isPending }] = await Promise.all([readRooms(), readRoomCategories()]);
const uncategorizedRooms = computed(() => rooms.value.filter(({ categoryId }) => !categoryId));
const roomsByCategory = computed(() =>
  categories.value.map((category) => ({
    category,
    rooms: rooms.value.filter(({ categoryId }) => categoryId === category.id),
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
