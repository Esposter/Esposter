import { authClient } from "@/services/auth/authClient";
import { useRoomStore } from "@/store/message/room";
import { useVoiceStore } from "@/store/message/room/voice";
import { useWebRtcStore } from "@/store/message/room/webRtc";
import { AdminActionType } from "@esposter/db-schema";

export const useAdminActionMap = () => {
  const { notify } = useAdminActionNotification();
  const roomStore = useRoomStore();
  const { storeDeleteRoom } = roomStore;
  const voiceStore = useVoiceStore();
  const { leaveVoice, setMute } = voiceStore;
  const { isForceMuted } = storeToRefs(voiceStore);
  const webRtcStore = useWebRtcStore();
  const { setLocalStreamMuted } = webRtcStore;
  const session = authClient.useSession();
  const sessionId = computed(() => session.value.data?.session.id);

  const adminActionMap: Record<AdminActionType, (roomId: string, durationMs?: number) => Promise<void>> = {
    [AdminActionType.BanUser]: async (roomId) => {
      await leaveVoice();
      await storeDeleteRoom({ id: roomId });
    },
    [AdminActionType.ForceMute]: async (roomId) => {
      if (sessionId.value) setMute(roomId, sessionId.value, true);
      setLocalStreamMuted(true);
      isForceMuted.value = true;
    },
    [AdminActionType.ForceUnmute]: async (roomId) => {
      if (sessionId.value) setMute(roomId, sessionId.value, false);
      setLocalStreamMuted(false);
      isForceMuted.value = false;
    },
    [AdminActionType.KickFromRoom]: async (roomId) => {
      await leaveVoice();
      await storeDeleteRoom({ id: roomId });
    },
    [AdminActionType.KickFromVoice]: async () => {
      await leaveVoice();
      notify("You have been kicked from voice.");
    },
    [AdminActionType.TimeoutUser]: async (roomId, durationMs) => {
      const minutes = durationMs ? Math.round(durationMs / 60000) : 0;
      notify(`You have been timed out for ${minutes} minute${minutes === 1 ? "" : "s"}.`);
      await leaveVoice();
    },
  };

  return adminActionMap;
};
