<script setup lang="ts">
import type { RoomCategoryInMessage, RoomInMessage } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getMovedItems } from "@/services/shared/getMovedItems";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { REORDER_HANDLE_CLASS } from "@/services/ui/constants";
import { useRoomStore } from "@/store/message/room";
import { useRoomCategoryStore } from "@/store/message/roomCategory";
import { getOrCreate } from "@esposter/shared";

const isCollapsed = useLocalStorage(LocalStorageKey.MessageSidebarRoomsCollapsed, false);
const readRoomCategories = useReadRoomCategories();
const roomCategoryStore = useRoomCategoryStore();
const { roomCategories } = storeToRefs(roomCategoryStore);
const { reorderRoomCategories } = roomCategoryStore;
const roomStore = useRoomStore();
const { hasMore, rooms } = storeToRefs(roomStore);
const getDragReorderProps = useDragReorder();
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
// The categories drag by their headers' handles, and a drop persists their new order
const roomCategoryReorderProps = computed(() =>
  getDragReorderProps(displayRoomCategories.value, reorderRoomCategories, `.${REORDER_HANDLE_CLASS}`),
);
// Undefined means the move cannot happen — already at the edge it is moving towards — so nothing is persisted
const moveRoomCategory = async (roomCategoryId: RoomCategoryInMessage["id"], direction: -1 | 1) => {
  const index = displayRoomCategories.value.findIndex(({ id }) => id === roomCategoryId);
  const reorderedRoomCategories = getMovedItems(displayRoomCategories.value, index, index + direction);
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
    <div :="roomCategoryReorderProps">
      <MessageModelRoomCategoryRoomGroup
        v-for="{ roomCategory, rooms: roomCategoryRooms } of roomCategoryGroups"
        :key="roomCategory.id"
        :category="roomCategory"
        :rooms="roomCategoryRooms"
        @move="moveRoomCategory(roomCategory.id, $event)"
      />
    </div>
  </MessageModelRoomBaseList>
  <MessageModelRoomInviteDialog />
  <MessageModelRoomSettingsDialog />
  <MessageModelRoomCategoryConfirmDeleteDialog />
</template>
