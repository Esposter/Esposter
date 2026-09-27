<script setup lang="ts">
import type { RoomCategoryInMessage, RoomInMessage } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getMovedItems } from "@/services/shared/getMovedItems";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { REORDER_HANDLE_CLASS, TOUCH_DRAG_DELAY_MS } from "@/services/ui/constants";
import { useRoomStore } from "@/store/message/room";
import { useRoomCategoryStore } from "@/store/message/roomCategory";
import { getOrCreate } from "@esposter/shared";
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
  const newCategoryIdRoomsMap = new Map<null | string, RoomInMessage[]>();
  for (const room of rooms.value) getOrCreate(newCategoryIdRoomsMap, room.categoryId, () => []).push(room);
  return newCategoryIdRoomsMap;
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
  const index = displayRoomCategories.value.findIndex(({ id }) => id === roomCategoryId);
  const reorderedRoomCategories = getMovedItems(displayRoomCategories.value, index, direction);
  if (reorderedRoomCategories) await reorderRoomCategories(reorderedRoomCategories);
};
</script>

<template>
  <MessageModelRoomBaseList :has-more :is-collapsed :is-pending @load-more="(onComplete) => readMoreRooms(onComplete)">
    <template #prepend>
      <MessageLeftSideBarCollapsibleHeader v-model:collapsed="isCollapsed" title="Rooms">
        <template #append>
          <MessageModelRoomCategoryCreateDialogButton />
          <MessageModelRoomCreateButton />
        </template>
      </MessageLeftSideBarCollapsibleHeader>
    </template>
    <UiEmptyState
      v-if="rooms.length === 0"
      description="Create a room or join one with an invite link."
      :meaning="UiIconMeaning.Comment"
      title="No rooms yet"
    />
    <MessageModelRoomCategoryRoomGroup :rooms="uncategorizedRooms" />
    <VueDraggable
      :delay="TOUCH_DRAG_DELAY_MS"
      delay-on-touch-only
      ghost-class="reorder-ghost"
      :handle="`.${REORDER_HANDLE_CLASS}`"
      :model-value="displayRoomCategories"
      @update:model-value="(newRoomCategories: RoomCategoryInMessage[]) => reorderRoomCategories(newRoomCategories)"
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
