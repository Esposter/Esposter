import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { authClient } from "@/services/auth/authClient";
import { useDirectMessageStore } from "@/store/message/room/directMessage";
import { RoutePath } from "@esposter/shared";

export const useDirectMessageSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const directMessageStore = useDirectMessageStore();
  const { storeDeleteDirectMessage, storeUpdateDirectMessage } = directMessageStore;
  const { directMessageParticipantsMap, directMessages } = storeToRefs(directMessageStore);
  const session = authClient.useSession();
  const router = useRouter();

  useOnlineSubscribable(directMessages, (newDirectMessages) => {
    if (newDirectMessages.length === 0) return undefined;

    const roomIds = newDirectMessages.map(({ id }) => id);
    const updateRoomUnsubscribable = $trpc.room.onUpdateRoom.subscribe(roomIds, {
      onData: (updatedDirectMessage) => {
        storeUpdateDirectMessage(updatedDirectMessage);
      },
    });
    const joinRoomUnsubscribables = roomIds.map((roomId) =>
      $trpc.room.onJoinRoom.subscribe([roomId], {
        onData: (user) => {
          const participants = directMessageParticipantsMap.value.get(roomId) ?? [];
          if (!participants.some(({ id }) => id === user.id))
            directMessageParticipantsMap.value.set(roomId, [user, ...participants]);
        },
      }),
    );
    const leaveRoomUnsubscribables = roomIds.map((roomId) =>
      $trpc.room.onLeaveRoom.subscribe([roomId], {
        onData: getSynchronizedFunction(async (userId) => {
          if (userId === session.value.data?.user.id) {
            storeDeleteDirectMessage({ id: roomId });
            await router.push({ path: RoutePath.MessagesIndex, replace: true });
            return;
          }

          const participants = directMessageParticipantsMap.value.get(roomId) ?? [];
          directMessageParticipantsMap.value.set(
            roomId,
            participants.filter(({ id }) => id !== userId),
          );
        }),
      }),
    );

    return () => {
      updateRoomUnsubscribable.unsubscribe();
      for (const unsubscribable of joinRoomUnsubscribables) unsubscribable.unsubscribe();
      for (const unsubscribable of leaveRoomUnsubscribables) unsubscribable.unsubscribe();
    };
  });
};
