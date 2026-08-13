<script setup lang="ts">
import type { RoomCategoryInMessage, RoomInMessage } from "@esposter/db-schema";

import {
  ROOM_CATEGORY_DRAG_HANDLE_CLASS,
  ROOM_CATEGORY_TOUCH_DRAG_DELAY_MS,
} from "@/services/message/roomCategory/constants";
import { getReorderedRoomCategories } from "@/services/message/roomCategory/getReorderedRoomCategories";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { useRoomStore } from "@/store/message/room";
import { useRoomCategoryStore } from "@/store/message/roomCategory";
import { VueDraggable } from "vue-draggable-plus";

const isCollapsed = useLocalStorage(LocalStorageKey.MessageSidebarRoomsCollapsed, false);
const readRoomCategories = useReadRoomCategories();
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
const displayCategories = computed(() =>
  categories.value.toSorted((a, b) => a.position - b.position || a.name.localeCompare(b.name)),
);
const roomsByCategory = computed(() =>
  displayCategories.value.map((category) => ({
    category,
    rooms: roomsByCategoryId.value.get(category.id) ?? [],
  })),
);
// Undefined means the move cannot happen — already at the edge it is moving towards — so nothing is persisted
const moveCategory = async (categoryId: RoomCategoryInMessage["id"], direction: -1 | 1) => {
  const reorderedCategories = getReorderedRoomCategories(displayCategories.value, categoryId, direction);
  if (reorderedCategories) await reorderRoomCategories(reorderedCategories);
};
</script>

<template>
  <MessageModelRoomBaseList :has-more :is-collapsed :is-pending @load-more="readMoreRooms">
    <template #prepend>
      <MessageLeftSideBarCollapsibleHeader v-model:collapsed="isCollapsed" title="Rooms">
        <template #append>
          <MessageModelRoomCategoryCreateDialogButton />
          <MessageModelRoomCreateButton />
        </template>
      </MessageLeftSideBarCollapsibleHeader>
    </template>
    <StyledEmptyState
      v-if="rooms.length === 0"
      description="Create a room or join one with an invite link."
      icon="mdi-forum-outline"
      title="No rooms yet"
    />
    <MessageModelRoomCategoryRoomGroup :rooms="uncategorizedRooms" />
    <VueDraggable
      :delay="ROOM_CATEGORY_TOUCH_DRAG_DELAY_MS"
      delay-on-touch-only
      ghost-class="room-category-ghost"
      :handle="`.${ROOM_CATEGORY_DRAG_HANDLE_CLASS}`"
      :model-value="displayCategories"
      @update:model-value="reorderRoomCategories"
    >
      <MessageModelRoomCategoryRoomGroup
        v-for="{ category, rooms: categoryRooms } of roomsByCategory"
        :key="category.id"
        :category
        :rooms="categoryRooms"
        @move="moveCategory(category.id, $event)"
      />
    </VueDraggable>
  </MessageModelRoomBaseList>
  <MessageModelRoomSettingsDialog />
  <MessageModelRoomCategoryConfirmDeleteDialog />
</template>

<style scoped>
/* Drop indicator — the ghost placeholder marks where the dragged category will land */
.room-category-ghost {
  border-top: 0.125rem solid rgb(var(--v-theme-primary));
  opacity: 0.5;
}
</style>
