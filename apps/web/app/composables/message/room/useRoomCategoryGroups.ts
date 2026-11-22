import type { RoomCategoryInMessage, RoomInMessage } from "@esposter/db-schema";

import { resolveRoomCategoryId } from "#src/services/message/roomCategory/resolveRoomCategoryId";
import { getMovedItems } from "#src/services/shared/getMovedItems";
import { REORDER_HANDLE_CLASS } from "#src/services/ui/constants";
import { useRoomStore } from "#src/store/message/room/index";
import { useUserToRoomStore } from "#src/store/message/room/userToRoom";
import { useRoomCategoryStore } from "#src/store/message/roomCategory";
import { getOrCreate } from "@esposter/shared";

// The sidebar's rooms under the category each is listed in, and the categories' order as a reader moves them
export const useRoomCategoryGroups = () => {
  const roomStore = useRoomStore();
  const { rooms } = storeToRefs(roomStore);
  const roomCategoryStore = useRoomCategoryStore();
  const { roomCategories } = storeToRefs(roomCategoryStore);
  const { reorderRoomCategories } = roomCategoryStore;
  const userToRoomStore = useUserToRoomStore();
  const { getMyUserToRoom } = userToRoomStore;
  const getDragReorderProps = useDragReorder();
  const categoryIdRoomsMap = computed(() => {
    const newCategoryIdRoomsMap = new Map<null | string, RoomInMessage[]>();
    // The category a room is listed under is the reader's own for it: another member's assignment is theirs alone
    for (const room of rooms.value)
      getOrCreate(
        newCategoryIdRoomsMap,
        resolveRoomCategoryId(roomCategories.value, getMyUserToRoom(room.id)?.categoryId),
        () => [],
      ).push(room);
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
  const moveRoomCategory = (roomCategoryId: RoomCategoryInMessage["id"], direction: -1 | 1) => {
    const index = displayRoomCategories.value.findIndex(({ id }) => id === roomCategoryId);
    const reorderedRoomCategories = getMovedItems(displayRoomCategories.value, index, index + direction);
    if (reorderedRoomCategories) reorderRoomCategories(reorderedRoomCategories);
  };
  return { moveRoomCategory, roomCategoryGroups, roomCategoryReorderProps, uncategorizedRooms };
};
