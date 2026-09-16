import { useRoomStore } from "@/store/message/room";
import { useCallStore } from "@/store/message/room/call";
import { useParticipantStore } from "@/store/message/room/call/participant";

export const useCallSubscribables = () => {
  const onlineSubscribableContext = getOnlineSubscribableContext();
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const callStore = useCallStore();
  const { setCurrentRoomCallSessionId } = callStore;
  const participantStore = useParticipantStore();
  const { clearSpeakers, setParticipantMap } = participantStore;
  const subscribeCallParticipants = useSubscribeCallParticipants();

  useOnlineSubscribable(
    currentRoomId,
    async (roomId) => {
      if (!roomId) return undefined;

      const callSessionId = await $trpc.callSession.readCallSessionId.query({ roomId });
      setCurrentRoomCallSessionId(callSessionId);
      if (!callSessionId) return undefined;

      const participantMap = await $trpc.callSession.readCallParticipantMap.query({ callSessionId });
      setParticipantMap(callSessionId, participantMap);

      const { unsubscribe } = subscribeCallParticipants(callSessionId);
      return () => {
        setCurrentRoomCallSessionId("");
        clearSpeakers();
        unsubscribe();
      };
    },
    onlineSubscribableContext,
  );
};
