import { getIdsFromKey } from "@/services/message/subscribables/getIdsFromKey";
import { getIdsKey } from "@/services/message/subscribables/getIdsKey";
import { getUnsubscribe } from "@/services/shared/getUnsubscribe";
import { useRoomStore } from "@/store/message/room";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { useMemberStore } from "@/store/message/user/member";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";

export const useUserToRoomSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { rooms } = storeToRefs(roomStore);
  const userToRoomStore = useUserToRoomStore();
  const { setMyUserToRoom } = userToRoomStore;
  const memberStore = useMemberStore();
  const { storeUpdateMembers } = memberStore;

  useOnlineSubscribable(
    () => getIdsKey(rooms.value),
    (roomIdsString) => {
      if (!roomIdsString) return undefined;

      return getUnsubscribe(
        $trpc.userToRoom.onUpdateUserToRoom.subscribe(getIdsFromKey(roomIdsString), {
          onData: getSynchronizedFunction(async (userToRoom) => {
            setMyUserToRoom(userToRoom.roomId, userToRoom);
            // A display name is a server row, so the room's copy of this member is re-read rather than written here
            await getResultAsync(async () => {
              const users = await $trpc.room.readUsersByIds.query({
                roomId: userToRoom.roomId,
                userIds: [userToRoom.userId],
              });
              storeUpdateMembers(userToRoom.roomId, users);
            }).match(noop, console.error);
          }),
        }),
      );
    },
  );
};
