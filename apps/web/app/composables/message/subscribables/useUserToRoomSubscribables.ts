import { getIdsKey } from "@/services/message/subscribables/getIdsKey";
import { getUnsubscribe } from "@/services/shared/getUnsubscribe";
import { useRoomStore } from "@/store/message/room";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { useMemberStore } from "@/store/message/user/member";
import { getResultAsync, noop } from "@esposter/shared";

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
        $trpc.userToRoom.onUpdateUserToRoom.subscribe(roomIdsString.split(","), {
          onData: (userToRoom) => {
            setMyUserToRoom(userToRoom.roomId, userToRoom);
            // A display name is a server row, so the room's copy of this member is re-read rather than written here
            // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and a subscription callback has nothing to await it
            getResultAsync(async () => {
              const members = await $trpc.room.readMembersByIds.query({
                roomId: userToRoom.roomId,
                userIds: [userToRoom.userId],
              });
              storeUpdateMembers(userToRoom.roomId, members);
            }).match(noop, console.error);
          },
        }),
      );
    },
  );
};
