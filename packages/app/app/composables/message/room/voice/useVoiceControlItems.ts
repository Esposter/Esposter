import { useVoiceStore } from "@/store/message/room/voice";

interface VoiceControlItem {
  color?: string;
  icon: string;
  onClick: () => void;
  tooltip: string;
  variant: "plain" | "tonal";
}

export const useVoiceControlItems = () => {
  const voiceStore = useVoiceStore();
  const { leaveVoice, toggleDeafen, toggleMute } = voiceStore;
  const { isDeafened, isMuted } = storeToRefs(voiceStore);
  return computed<VoiceControlItem[]>(() => [
    {
      color: isMuted.value ? "error" : undefined,
      icon: isMuted.value ? "mdi-microphone-off" : "mdi-microphone",
      onClick: () => {
        toggleMute();
      },
      tooltip: isMuted.value ? "Unmute" : "Mute",
      variant: "plain",
    },
    {
      color: isDeafened.value ? "error" : undefined,
      icon: isDeafened.value ? "mdi-headphones-off" : "mdi-headphones",
      onClick: () => {
        toggleDeafen();
      },
      tooltip: isDeafened.value ? "Undeafen" : "Deafen",
      variant: "plain",
    },
    {
      color: "error",
      icon: "mdi-phone-hangup",
      onClick: () => {
        leaveVoice();
      },
      tooltip: "Leave Voice",
      variant: "tonal",
    },
  ]);
};
