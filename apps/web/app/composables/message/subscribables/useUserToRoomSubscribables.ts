import { getIdsKey } from "@/services/message/subscribables/getIdsKey";
import { getUnsubscribe } from "@/services/shared/getUnsubscribe";
import { useRoomStore } from "@/store/message/room";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";

export const useUserToRoomSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { rooms } = storeToRefs(roomStore);
  const userToRoomStore = useUserToRoomStore();
  const { setMyUserToRoom, setNickname } = userToRoomStore;

  useOnlineSubscribable(
    () => getIdsKey(rooms.value),
    (roomIdsString) => {
      if (!roomIdsString) return undefined;

      return getUnsubscribe(
        $trpc.userToRoom.onUpdateUserToRoom.subscribe(roomIdsString.split(","), {
          onData: (userToRoom) => {
            setMyUserToRoom(userToRoom.roomId, userToRoom);
            setNickname(userToRoom.roomId, userToRoom.userId, userToRoom.nickname);
          },
        }),
      );
    },
  );
};
