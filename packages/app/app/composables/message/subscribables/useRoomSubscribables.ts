import type { Unsubscribable } from "@trpc/server/observable";

import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { useRoomStore } from "@/store/message/room";
import { useMemberStore } from "@/store/message/user/member";

export const useRoomSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { storeDeleteRoom, storeUpdateRoom } = roomStore;
  const { rooms } = storeToRefs(roomStore);
  const memberStore = useMemberStore();
  const { createMember, deleteMember } = memberStore;

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
      onData: (input) => storeUpdateRoom(input),
    });
    deleteRoomUnsubscribable.value = $trpc.room.onDeleteRoom.subscribe(newRoomIds, {
      onData: getSynchronizedFunction((id) => storeDeleteRoom({ id })),
    });
    joinRoomUnsubscribable.value = $trpc.room.onJoinRoom.subscribe(newRoomIds, {
      onData: (user) => createMember(user),
    });
    leaveRoomUnsubscribable.value = $trpc.room.onLeaveRoom.subscribe(newRoomIds, {
      onData: (userId) => deleteMember({ id: userId }),
    });
  });

  onMounted(() => {
    trigger();
  });

  onUnmounted(() => {
    unsubscribe();
  });
};
