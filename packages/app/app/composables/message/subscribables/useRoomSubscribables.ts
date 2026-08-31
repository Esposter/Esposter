import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { getIdsKey } from "@/services/message/subscribables/getIdsKey";
import { useRoomStore } from "@/store/message/room";
import { useMemberStore } from "@/store/message/user/member";
import { getResultAsync, noop } from "@esposter/shared";

export const useRoomSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { storeDeleteRoom, storeUpdateRoom } = roomStore;
  const { rooms } = storeToRefs(roomStore);
  const memberStore = useMemberStore();
  const { storeCreateMember, storeDeleteMember } = memberStore;

  useOnlineSubscribable(
    () => getIdsKey(rooms.value),
    (roomIdsString) => {
      if (!roomIdsString) return undefined;

      const newRoomIds = roomIdsString.split(",");
      const updateRoomUnsubscribable = $trpc.room.onUpdateRoom.subscribe(newRoomIds, {
        onData: (updatedRoom) => {
          storeUpdateRoom(updatedRoom);
        },
      });
      const deleteRoomUnsubscribable = $trpc.room.onDeleteRoom.subscribe(newRoomIds, {
        onData: getSynchronizedFunction((id) =>
          getResultAsync(() => storeDeleteRoom({ id })).match(noop, console.error),
        ),
      });
      const joinRoomUnsubscribable = $trpc.room.onJoinRoom.subscribe(newRoomIds, {
        onData: ({ roomId, user }) => {
          storeCreateMember(roomId, user);
        },
      });
      const leaveRoomUnsubscribable = $trpc.room.onLeaveRoom.subscribe(newRoomIds, {
        onData: ({ roomId, userId }) => {
          storeDeleteMember(roomId, userId);
        },
      });

      return () => {
        updateRoomUnsubscribable.unsubscribe();
        deleteRoomUnsubscribable.unsubscribe();
        joinRoomUnsubscribable.unsubscribe();
        leaveRoomUnsubscribable.unsubscribe();
      };
    },
  );
};
