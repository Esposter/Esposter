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
const { roomCategories } = storeToRefs(roomCategoryStore);
const { reorderRoomCategories } = roomCategoryStore;
const roomStore = useRoomStore();
const { hasMore, rooms } = storeToRefs(roomStore);
const { readMoreRooms, readRooms } = await useReadRooms();
const [{ isPending }] = await Promise.all([readRooms(), readRoomCategories()]);
const categoryIdRoomsMap = computed(() => {
  const roomsMap = new Map<null | string, RoomInMessage[]>();
  for (const room of rooms.value) {
    const group = roomsMap.get(room.categoryId) ?? [];
    group.push(room);
    roomsMap.set(room.categoryId, group);
  }
  return roomsMap;
});
const uncategorizedRooms = computed(() => categoryIdRoomsMap.value.get(null) ?? []);
const displayRoomCategories = computed(() =>
  roomCategories.value.toSorted(
    (firstRoomCategory, secondRoomCategory) =>
      firstRoomCategory.position - secondRoomCategory.position ||
      firstRoomCategory.name.localeCompare(secondRoomCategory.name),
  ),
);
const roomCategoryGroups = computed(() =>
  displayRoomCategories.value.map((roomCategory) => ({
    roomCategory,
    rooms: categoryIdRoomsMap.value.get(roomCategory.id) ?? [],
  })),
);
// Undefined means the move cannot happen — already at the edge it is moving towards — so nothing is persisted
const moveRoomCategory = async (roomCategoryId: RoomCategoryInMessage["id"], direction: -1 | 1) => {
  const reorderedRoomCategories = getReorderedRoomCategories(displayRoomCategories.value, roomCategoryId, direction);
  if (reorderedRoomCategories) await reorderRoomCategories(reorderedRoomCategories);
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
      :model-value="displayRoomCategories"
      @update:model-value="reorderRoomCategories"
    >
      <MessageModelRoomCategoryRoomGroup
        v-for="{ roomCategory, rooms: roomCategoryRooms } of roomCategoryGroups"
        :key="roomCategory.id"
        :category="roomCategory"
        :rooms="roomCategoryRooms"
        @move="moveRoomCategory(roomCategory.id, $event)"
      />
    </VueDraggable>
  </MessageModelRoomBaseList>
  <MessageModelRoomInviteDialog />
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
