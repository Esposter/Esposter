import { getSynchronizedFunction } from "#shared/error/getSynchronizedFunction";
import { useCallStore } from "@/store/message/room/call";

interface CallControlItem {
  color?: string;
  icon: string;
  onClick: () => void;
  tooltip: string;
  variant: "plain" | "tonal";
}

export const useCallControlItems = () => {
  const callStore = useCallStore();
  const { leaveCall, toggleDeafen, toggleMute } = callStore;
  const { isDeafened, isMuted } = storeToRefs(callStore);
  return computed<CallControlItem[]>(() => [
    {
      color: isMuted.value ? "error" : undefined,
      icon: isMuted.value ? "mdi-microphone-off" : "mdi-microphone",
      onClick: getSynchronizedFunction(async () => {
        await toggleMute();
      }),
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
      onClick: getSynchronizedFunction(async () => {
        await leaveCall();
      }),
      tooltip: "Leave Call",
      variant: "tonal",
    },
  ]);
};
