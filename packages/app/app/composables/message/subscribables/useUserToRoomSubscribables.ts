import { useRoomStore } from "@/store/message/room";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";

export const useUserToRoomSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { rooms } = storeToRefs(roomStore);
  const userToRoomStore = useUserToRoomStore();
  const { setUserToRoom } = userToRoomStore;

  useOnlineSubscribable(rooms, (newRooms) => {
    if (newRooms.length === 0) return undefined;

    const newRoomIds = newRooms.map(({ id }) => id);
    const updateUserToRoomUnsubscribable = $trpc.userToRoom.onUpdateUserToRoom.subscribe(newRoomIds, {
      onData: (userToRoom) => {
        setUserToRoom(userToRoom.roomId, userToRoom.userId, userToRoom);
      },
    });

    return () => {
      updateUserToRoomUnsubscribable.unsubscribe();
    };
  });
};
