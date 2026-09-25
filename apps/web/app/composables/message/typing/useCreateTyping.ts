import { useInputStore } from "@/store/message/input";
import { useRoomStore } from "@/store/message/room";

export const useCreateTyping = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const inputStore = useInputStore();
  const { input } = storeToRefs(inputStore);
  const throttledInput = useThrottle(input, Temporal.Duration.from({ seconds: 1 }).total("milliseconds"));
  watch(throttledInput, async () => {
    if (currentRoomId.value) await $trpc.message.createTyping.query({ roomId: currentRoomId.value });
  });
};
