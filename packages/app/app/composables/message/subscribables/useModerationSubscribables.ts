import { useRoomStore } from "@/store/message/room";
import { useVoiceStore } from "@/store/message/room/voice";

export const useModerationSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const voiceStore = useVoiceStore();
  const { handleAdminAction } = voiceStore;

  useOnlineSubscribable(currentRoomId, (roomId) => {
    if (!roomId) return undefined;

    const adminActionUnsubscribable = $trpc.moderation.onAdminAction.subscribe(
      { roomId },
      { onData: ({ durationMs, type }) => handleAdminAction(roomId, type, durationMs) },
    );

    return () => adminActionUnsubscribable.unsubscribe();
  });
};
