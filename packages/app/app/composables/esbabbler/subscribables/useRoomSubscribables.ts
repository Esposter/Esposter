import type { Unsubscribable } from "@trpc/server/observable";

import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { useEsbabblerStore } from "@/store/esbabbler";
import { useRoomStore } from "@/store/esbabbler/room";

export const useRoomSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const esbabblerStore = useEsbabblerStore();
  const { getUserDataMap, setUserDataMap } = esbabblerStore;
  const roomStore = useRoomStore();
  const { storeDeleteRoom, storeUpdateRoom } = roomStore;
  const { rooms } = storeToRefs(roomStore);

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

    const newRoomIds = newRooms.map(({ id }) => id);
    if (newRoomIds.length === 0) return;

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
        const userDataMap = getUserDataMap(roomId);
        if (!userDataMap) {
          setUserDataMap(roomId, new Map([[user.id, user]]));
          return;
        } else userDataMap.set(user.id, user);
      },
    });
    leaveRoomUnsubscribable.value = $trpc.room.onLeaveRoom.subscribe(newRoomIds, {
      onData: ({ roomId, userId }) => {
        const userDataMap = getUserDataMap(roomId);
        if (!userDataMap) return;
        else userDataMap.delete(userId);
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
