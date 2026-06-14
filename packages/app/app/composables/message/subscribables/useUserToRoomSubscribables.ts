import { useRoomStore } from "@/store/message/room";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";

export const useUserToRoomSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { rooms } = storeToRefs(roomStore);
  const userToRoomStore = useUserToRoomStore();
  const { setMyUserToRoom, setNickname } = userToRoomStore;

  useOnlineSubscribable(
    () =>
      rooms.value
        .map(({ id }) => id)
        .toSorted()
        .join(","),
    (roomIdsString) => {
      if (!roomIdsString) return undefined;

      const newRoomIds = roomIdsString.split(",");
      const updateUserToRoomUnsubscribable = $trpc.userToRoom.onUpdateUserToRoom.subscribe(newRoomIds, {
        onData: (userToRoom) => {
          setMyUserToRoom(userToRoom.roomId, userToRoom);
          setNickname(userToRoom.roomId, userToRoom.userId, userToRoom.nickname);
        },
      });

      return () => {
        updateUserToRoomUnsubscribable.unsubscribe();
      };
    },
  );
};
