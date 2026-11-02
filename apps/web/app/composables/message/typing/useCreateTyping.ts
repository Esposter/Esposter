import { useInputStore } from "@/store/message/input";
import { useRoomStore } from "@/store/message/room";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";

export const useCreateTyping = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const inputStore = useInputStore();
  const { input } = storeToRefs(inputStore);
  const throttledInput = useThrottle(input, Temporal.Duration.from({ seconds: 1 }).total("milliseconds"));
  // Nothing awaits the watch, so a rejected typing ping is terminated here rather than left to the watcher's handler
  watch(
    throttledInput,
    getSynchronizedFunction(() =>
      getResultAsync(async () => {
        if (currentRoomId.value) await $trpc.message.createTyping.query({ roomId: currentRoomId.value });
      }).match(noop, console.error),
    ),
  );
};
