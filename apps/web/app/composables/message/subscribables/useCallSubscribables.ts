import { useRoomStore } from "@/store/message/room";
import { useCallStore } from "@/store/message/room/call";

export const useCallSubscribables = () => {
  const onlineSubscribableContext = getOnlineSubscribableContext();
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const callStore = useCallStore();
  const { activeCallSessionId, currentRoomCallSessionId } = storeToRefs(callStore);
  const { setCurrentRoomCallSessionId } = callStore;
  const subscribeCallParticipants = useSubscribeCallParticipants();

  useCallParticipantSubscribables(onlineSubscribableContext);
  useOnlineSubscribable(
    currentRoomId,
    async (roomId) => {
      if (!roomId) return undefined;

      setCurrentRoomCallSessionId(await $trpc.callSession.readCallSessionId.query({ roomId }));
      return () => {
        // The speakers belong to the joined call and leaveCall clears them, so leaving the viewed room leaves them alone
        setCurrentRoomCallSessionId("");
      };
    },
    onlineSubscribableContext,
  );
  // The viewed room's participants, unless the joined call is that same session: its own subscription holds them, and
  // They come back here once the user leaves it
  useOnlineSubscribable(
    () => (currentRoomCallSessionId.value === activeCallSessionId.value ? "" : currentRoomCallSessionId.value),
    async (callSessionId) => {
      if (!callSessionId) return undefined;

      const { unsubscribe } = await subscribeCallParticipants(callSessionId);
      return unsubscribe;
    },
    onlineSubscribableContext,
  );
};
