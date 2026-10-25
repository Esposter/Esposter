import { getIdsKey } from "@/services/message/subscribables/getIdsKey";
import { getUnsubscribe } from "@/services/shared/getUnsubscribe";
import { useRoomStore } from "@/store/message/room";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { useUserStore } from "@/store/message/user";
import { getResultAsync, noop } from "@esposter/shared";

export const useUserToRoomSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { rooms } = storeToRefs(roomStore);
  const userToRoomStore = useUserToRoomStore();
  const { setMyUserToRoom } = userToRoomStore;
  const userStore = useUserStore();
  const { storeRoomMembers } = userStore;

  useOnlineSubscribable(
    () => getIdsKey(rooms.value),
    (roomIdsString) => {
      if (!roomIdsString) return undefined;

      return getUnsubscribe(
        $trpc.userToRoom.onUpdateUserToRoom.subscribe(roomIdsString.split(","), {
          onData: (userToRoom) => {
            setMyUserToRoom(userToRoom.roomId, userToRoom);
            // A display name is a server row, so the room's copy of this member is re-read rather than written here
            getResultAsync(async () => {
              const members = await $trpc.room.readMembersByIds.query({
                roomId: userToRoom.roomId,
                userIds: [userToRoom.userId],
              });
              storeRoomMembers(userToRoom.roomId, members);
            }).match(noop, console.error);
          },
        }),
      );
    },
  );
};
