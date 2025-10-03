import type { Unsubscribable } from "@trpc/server/observable";

import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { useMemberStore } from "@/store/message/member";
import { useRoomStore } from "@/store/message/room";

export const useRoomSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { getMemberDataMap, setMemberDataMap, storeDeleteRoom, storeUpdateRoom } = roomStore;
  const { currentRoomId, rooms } = storeToRefs(roomStore);
  const memberStore = useMemberStore();
  const { pushMembers } = memberStore;

  const updateRoomUnsubscribable = ref<Unsubscribable>();
  const deleteRoomUnsubscribable = ref<Unsubscribable>();
  const joinRoomUnsubscribable = ref<Unsubscribable>();
  const leaveRoomUnsubscribable = ref<Unsubscribable>();

  const unsubscribe = () => {
    updateRoomUnsubscribable.value?.unsubscribe();
    deleteRoomUnsubscribable.value?.unsubscribe();
    joinRoomUnsubscribable.value?.unsubscribe();
    leaveRoomUnsubscribable.value?.unsubscribe();
  };

  const { trigger } = watchTriggerable(rooms, (newRooms) => {
    unsubscribe();

    if (newRooms.length === 0) return;

    const newRoomIds = newRooms.map(({ id }) => id);
    updateRoomUnsubscribable.value = $trpc.room.onUpdateRoom.subscribe(newRoomIds, {
      onData: (input) => {
        storeUpdateRoom(input);
      },
    });
    deleteRoomUnsubscribable.value = $trpc.room.onDeleteRoom.subscribe(newRoomIds, {
      onData: getSynchronizedFunction(async (id) => {
        await storeDeleteRoom({ id });
      }),
    });
    joinRoomUnsubscribable.value = $trpc.room.onJoinRoom.subscribe(newRoomIds, {
      onData: ({ roomId, user }) => {
        const memberDataMap = getMemberDataMap(roomId);
        if (memberDataMap) memberDataMap.set(user.id, user);
        else setMemberDataMap(roomId, new Map([[user.id, user]]));

        if (roomId === currentRoomId.value) pushMembers(user);
      },
    });
    leaveRoomUnsubscribable.value = $trpc.room.onLeaveRoom.subscribe(newRoomIds, {
      onData: ({ roomId, userId }) => {
        const memberDataMap = getMemberDataMap(roomId);
        memberDataMap?.delete(userId);
      },
    });
  });

  onMounted(() => {
    trigger();
  });

  onUnmounted(() => {
    unsubscribe();
  });
};
