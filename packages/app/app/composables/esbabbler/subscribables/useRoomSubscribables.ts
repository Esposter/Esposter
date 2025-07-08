import type { Unsubscribable } from "@trpc/server/observable";

import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { useEsbabblerStore } from "@/store/esbabbler";
import { useMemberStore } from "@/store/esbabbler/member";
import { useRoomStore } from "@/store/esbabbler/room";

export const useRoomSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const esbabblerStore = useEsbabblerStore();
  const { getUserDataMap, setUserDataMap } = esbabblerStore;
  const roomStore = useRoomStore();
  const { storeDeleteRoom, storeUpdateRoom } = roomStore;
  const { currentRoomId, rooms } = storeToRefs(roomStore);
  const memberStore = useMemberStore();
  const { pushMemberIds } = memberStore;

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
        const userDataMap = getUserDataMap(roomId);
        if (userDataMap) userDataMap.set(user.id, user);
        else setUserDataMap(roomId, new Map([[user.id, user]]));

        if (roomId === currentRoomId.value) pushMemberIds(user.id);
      },
    });
    leaveRoomUnsubscribable.value = $trpc.room.onLeaveRoom.subscribe(newRoomIds, {
      onData: ({ roomId, userId }) => {
        const userDataMap = getUserDataMap(roomId);
        userDataMap?.delete(userId);
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
