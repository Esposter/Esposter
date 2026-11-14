import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { useMemberStore } from "@/store/message/user/member";
import { useConnectionStore } from "@/store/realtime/connection";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";

export const useUserToRoomSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const userToRoomStore = useUserToRoomStore();
  const { setMyUserToRoom } = userToRoomStore;
  const memberStore = useMemberStore();
  const { storeUpdateMembers } = memberStore;
  const connectionStore = useConnectionStore();
  const { onUserEvent } = connectionStore;
  const unregister = onUserEvent(
    "updateUserToRoom",
    getSynchronizedFunction(async (userToRoom) => {
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
  );
  onScopeDispose(unregister);
};
