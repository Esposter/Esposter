import { useRoomStore } from "@/store/message/room";
import { useCallStore } from "@/store/message/room/call";

export const useCallSubscribables = () => {
  const onlineSubscribableContext = getOnlineSubscribableContext();
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const callStore = useCallStore();
  const { setCurrentRoomCallSessionId } = callStore;

  // Only the joined call's participants are subscribed: the call socket opens to a joined or knocking connection alone,
  // So a viewed room whose call the user has not joined has no participants to read
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
};
