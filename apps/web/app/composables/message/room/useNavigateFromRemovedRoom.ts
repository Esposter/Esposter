import { useRoomStore } from "#src/store/message/room/index";
import { RoutePath } from "@esposter/shared";

// A room the reader is on leaves the list when its membership is tombstoned: a kick or a ban, a leave on another device, or
// The room's deletion. The page takes the reader off it once, to the messages index. A room the list never showed has no
// Removal to follow, so opening one is not a navigation
export const useNavigateFromRemovedRoom = () => {
  const roomStore = useRoomStore();
  const { currentRoomId, rooms } = storeToRefs(roomStore);
  watch(rooms, async (nextRooms, previousRooms) => {
    const roomId = currentRoomId.value;
    const isPreviouslyListed = previousRooms.some(({ id }) => id === roomId);
    const isListed = nextRooms.some(({ id }) => id === roomId);
    if (isPreviouslyListed && !isListed) await navigateTo(RoutePath.MessagesIndex, { replace: true });
  });
};
