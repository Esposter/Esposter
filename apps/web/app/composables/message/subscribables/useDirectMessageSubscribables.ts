import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { authClient } from "@/services/auth/authClient";
import { getIdsKey } from "@/services/message/subscribables/getIdsKey";
import { getUnsubscribe } from "@/services/shared/getUnsubscribe";
import { useDirectMessageStore } from "@/store/message/room/directMessage";
import { getResultAsync, noop, RoutePath, takeOne } from "@esposter/shared";

export const useDirectMessageSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const directMessageStore = useDirectMessageStore();
  const {
    storeCreateDirectMessageParticipant,
    storeDeleteDirectMessage,
    storeDeleteDirectMessageParticipant,
    storeUpdateDirectMessage,
  } = directMessageStore;
  const { directMessages } = storeToRefs(directMessageStore);
  const session = authClient.useSession();

  useOnlineSubscribable(
    () => getIdsKey(directMessages.value),
    (roomIdsString) => {
      if (!roomIdsString) return undefined;

      const roomIds = roomIdsString.split(",");
      return getUnsubscribe(
        $trpc.room.onUpdateRoom.subscribe(roomIds, {
          onData: (updatedDirectMessage) => {
            storeUpdateDirectMessage(updatedDirectMessage);
          },
        }),
        // One subscription over every direct message, because the event carries the room it happened in
        $trpc.room.onJoinRoom.subscribe(roomIds, {
          onData: ({ roomId, user }) => {
            storeCreateDirectMessageParticipant(roomId, user);
          },
        }),
        $trpc.room.onLeaveRoom.subscribe(roomIds, {
          onData: getSynchronizedFunction(({ roomId, userId }) =>
            getResultAsync(async () => {
              if (userId === session.value.data?.user.id) {
                storeDeleteDirectMessage({ id: roomId });
                await navigateTo(
                  directMessages.value.length > 0
                    ? RoutePath.Messages(takeOne(directMessages.value).id)
                    : RoutePath.MessagesIndex,
                  { replace: true },
                );
              } else storeDeleteDirectMessageParticipant(roomId, userId);
            }).match(noop, console.error),
          ),
        }),
      );
    },
  );
};
