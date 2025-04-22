import type { Unsubscribable } from "@trpc/server/observable";

import { useEsbabblerStore } from "@/store/esbabbler";
import { useRoomStore } from "@/store/esbabbler/room";

export const useRoomSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const esbabblerStore = useEsbabblerStore();
  const { userMap } = storeToRefs(esbabblerStore);
  const roomStore = useRoomStore();
  const { storeDeleteRoom, storeUpdateRoom } = roomStore;
  const { currentRoomId } = storeToRefs(roomStore);

  const updateRoomUnsubscribable = ref<Unsubscribable>();
  const deleteRoomUnsubscribable = ref<Unsubscribable>();
  const joinRoomUnsubscribable = ref<Unsubscribable>();
  const leaveRoomUnsubscribable = ref<Unsubscribable>();

  onMounted(() => {
    updateRoomUnsubscribable.value = $trpc.room.onUpdateRoom.subscribe(undefined, {
      onData: (input) => {
        storeUpdateRoom(input);
      },
    });
    deleteRoomUnsubscribable.value = $trpc.room.onDeleteRoom.subscribe(undefined, {
      onData: (id) => {
        storeDeleteRoom({ id });
      },
    });

    if (!currentRoomId.value) return;

    joinRoomUnsubscribable.value = $trpc.room.onJoinRoom.subscribe(currentRoomId.value, {
      onData: (user) => {
        userMap.value.set(user.id, user);
      },
    });
    leaveRoomUnsubscribable.value = $trpc.room.onLeaveRoom.subscribe(currentRoomId.value, {
      onData: (userId) => {
        userMap.value.delete(userId);
      },
    });
  });

  onUnmounted(() => {
    updateRoomUnsubscribable.value?.unsubscribe();
    deleteRoomUnsubscribable.value?.unsubscribe();
    joinRoomUnsubscribable.value?.unsubscribe();
    leaveRoomUnsubscribable.value?.unsubscribe();
  });
};
