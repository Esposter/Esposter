<script setup lang="ts">
import type { RoomCategoryInMessage, RoomInMessage } from "@esposter/db-schema";

import { ROOM_CATEGORY_DRAG_HANDLE_CLASS, ROOM_CATEGORY_GHOST_CLASS } from "@/services/message/roomCategory/constants";
import { useRoomStore } from "@/store/message/room";
import { useRoomCategoryStore } from "@/store/message/roomCategory";
import { takeOne } from "@esposter/shared";
import { VueDraggable } from "vue-draggable-plus";

const isCollapsed = useLocalStorage("message-sidebar-rooms-collapsed", false);
const { readRoomCategories } = useReadRoomCategories();
const roomCategoryStore = useRoomCategoryStore();
const { categories } = storeToRefs(roomCategoryStore);
const { reorderRoomCategories } = roomCategoryStore;
const roomStore = useRoomStore();
const { hasMore, rooms } = storeToRefs(roomStore);
const { readMoreRooms, readRooms } = await useReadRooms();
const [{ isPending }] = await Promise.all([readRooms(), readRoomCategories()]);
const roomsByCategoryId = computed(() => {
  const map = new Map<null | string, RoomInMessage[]>();
  for (const room of rooms.value) {
    const group = map.get(room.categoryId) ?? [];
    group.push(room);
    map.set(room.categoryId, group);
  }
  return map;
});
const uncategorizedRooms = computed(() => roomsByCategoryId.value.get(null) ?? []);
const sortedCategories = computed(() =>
  categories.value.toSorted((a, b) => a.position - b.position || a.name.localeCompare(b.name)),
);
const roomsByCategory = computed(() =>
  sortedCategories.value.map((category) => ({
    category,
    rooms: roomsByCategoryId.value.get(category.id) ?? [],
  })),
);
const moveCategory = async (category: RoomCategoryInMessage, direction: -1 | 1) => {
  const fromIndex = sortedCategories.value.findIndex(({ id }) => id === category.id);
  const toIndex = fromIndex + direction;
  if (toIndex < 0 || toIndex >= sortedCategories.value.length) return;
  const newCategories = [...sortedCategories.value];
  const movedCategory = takeOne(newCategories.splice(fromIndex, 1));
  newCategories.splice(toIndex, 0, movedCategory);
  await reorderRoomCategories(newCategories);
};
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
    <StyledEmptyState
      v-if="rooms.length === 0"
      description="Create a room or join one with an invite link."
      icon="mdi-forum-outline"
      title="No rooms yet"
    />
    <MessageModelRoomCategoryRoomGroup :rooms="uncategorizedRooms" />
    <VueDraggable
      :ghost-class="ROOM_CATEGORY_GHOST_CLASS"
      :handle="`.${ROOM_CATEGORY_DRAG_HANDLE_CLASS}`"
      :model-value="sortedCategories"
      @update:model-value="reorderRoomCategories"
    >
      <MessageModelRoomCategoryRoomGroup
        v-for="{ category, rooms: categoryRooms } of roomsByCategory"
        :key="category.id"
        :category
        :rooms="categoryRooms"
        @move="moveCategory(category, $event)"
      />
    </VueDraggable>
  </MessageModelRoomBaseList>
  <MessageModelRoomSettingsDialog />
  <MessageModelRoomCategoryConfirmDeleteDialog />
</template>

<style scoped>
/* Drop indicator — the ghost placeholder marks where the dragged category will land */
.room-category-ghost {
  border-top: 2px solid rgb(var(--v-theme-primary));
  opacity: 0.5;
}
</style>
