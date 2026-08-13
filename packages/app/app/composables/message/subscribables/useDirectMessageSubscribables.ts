import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { authClient } from "@/services/auth/authClient";
import { getIdsKey } from "@/services/message/subscribables/getIdsKey";
import { useDirectMessageStore } from "@/store/message/room/directMessage";
import { RoutePath, takeOne } from "@esposter/shared";

export const useDirectMessageSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const directMessageStore = useDirectMessageStore();
  const { storeDeleteDirectMessage, storeUpdateDirectMessage } = directMessageStore;
  const { directMessageParticipantsMap, directMessages } = storeToRefs(directMessageStore);
  const session = authClient.useSession();

  useOnlineSubscribable(
    () => getIdsKey(directMessages.value),
    (roomIdsString) => {
      if (!roomIdsString) return undefined;

      const roomIds = roomIdsString.split(",");
      const updateRoomUnsubscribable = $trpc.room.onUpdateRoom.subscribe(roomIds, {
        onData: (updatedDirectMessage) => {
          storeUpdateDirectMessage(updatedDirectMessage);
        },
      });
      // One subscription over every direct message, because the event carries the room it happened in
      const joinRoomUnsubscribable = $trpc.room.onJoinRoom.subscribe(roomIds, {
        onData: ({ roomId, user }) => {
          const participants = directMessageParticipantsMap.value.get(roomId) ?? [];
          if (!participants.some(({ id }) => id === user.id))
            directMessageParticipantsMap.value.set(roomId, [user, ...participants]);
        },
      });
      const leaveRoomUnsubscribable = $trpc.room.onLeaveRoom.subscribe(roomIds, {
        onData: getSynchronizedFunction(async ({ roomId, userId }) => {
          if (userId === session.value.data?.user.id) {
            storeDeleteDirectMessage({ id: roomId });
            await navigateTo(
              directMessages.value.length > 0
                ? RoutePath.Messages(takeOne(directMessages.value).id)
                : RoutePath.MessagesIndex,
              { replace: true },
            );
            return;
          }
          const participants = directMessageParticipantsMap.value.get(roomId) ?? [];
          directMessageParticipantsMap.value.set(
            roomId,
            participants.filter(({ id }) => id !== userId),
          );
        }),
      });

      return () => {
        updateRoomUnsubscribable.unsubscribe();
        joinRoomUnsubscribable.unsubscribe();
        leaveRoomUnsubscribable.unsubscribe();
      };
    },
  );
};
