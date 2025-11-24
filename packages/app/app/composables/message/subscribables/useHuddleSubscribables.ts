import { useHuddle } from "@/composables/message/useHuddle";
import { useRoomStore } from "@/store/message/room";

export const useHuddleSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const { callPeer, huddleUsers, isInHuddle, removePeerConnection } = useHuddle();

  watchImmediate(currentRoomId, async (roomId) => {
    if (!roomId) return;

    const readHuddleUsers = await $trpc.huddle.readHuddleUsers.query({ roomId });
    huddleUsers.value = readHuddleUsers.map(({ user }) => user);
  });

  watchImmediate(currentRoomId, (roomId) => {
    if (!roomId) return;

    const joinHuddleSubscription = $trpc.huddle.onJoinHuddle.subscribe(
      { roomId },
      {
        onData: (user) => {
          huddleUsers.value.push(user);
          if (isInHuddle.value) callPeer(user.id, user);
        },
      },
    );
    const leaveHuddleSubscription = $trpc.huddle.onLeaveHuddle.subscribe(
      { roomId },
      {
        onData: ({ userId }) => {
          huddleUsers.value = huddleUsers.value.filter(({ id }) => id !== userId);
          removePeerConnection(userId);
        },
      },
    );

    return () => {
      joinHuddleSubscription.unsubscribe();
      leaveHuddleSubscription.unsubscribe();
    };
  });
};
