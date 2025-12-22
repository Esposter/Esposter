import type { WatchHandle } from "vue";

import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { useRoomStore } from "@/store/message/room";
import { useMemberStore } from "@/store/message/user/member";

export const useRoomSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { storeDeleteRoom, storeUpdateRoom } = roomStore;
  const { rooms } = storeToRefs(roomStore);
  const memberStore = useMemberStore();
  const { storeCreateMember, storeDeleteMember } = memberStore;
  let watchHandle: undefined | WatchHandle;

  onMounted(() => {
    watchHandle = watchImmediate(rooms, (newRooms) => {
      if (newRooms.length === 0) return;

      const newRoomIds = newRooms.map(({ id }) => id);
      const updateRoomUnsubscribable = $trpc.room.onUpdateRoom.subscribe(newRoomIds, {
        onData: (input) => {
          storeUpdateRoom(input);
        },
      });
      const deleteRoomUnsubscribable = $trpc.room.onDeleteRoom.subscribe(newRoomIds, {
        onData: getSynchronizedFunction((id) => storeDeleteRoom({ id })),
      });
      const joinRoomUnsubscribable = $trpc.room.onJoinRoom.subscribe(newRoomIds, {
        onData: (user) => {
          storeCreateMember(user);
        },
      });
      const leaveRoomUnsubscribable = $trpc.room.onLeaveRoom.subscribe(newRoomIds, {
        onData: (userId) => {
          storeDeleteMember(userId);
        },
      });

      return () => {
        updateRoomUnsubscribable.unsubscribe();
        deleteRoomUnsubscribable.unsubscribe();
        joinRoomUnsubscribable.unsubscribe();
        leaveRoomUnsubscribable.unsubscribe();
      };
    });
  });

  onUnmounted(() => {
    watchHandle?.();
  });
};
