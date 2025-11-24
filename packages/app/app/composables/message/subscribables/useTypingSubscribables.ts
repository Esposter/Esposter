import type { WatchHandle } from "vue";

import { dayjs } from "#shared/services/dayjs";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";

export const useTypingSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const dataStore = useDataStore();
  const { typings } = storeToRefs(dataStore);
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const typingTimeoutIdMap = ref(new Map<string, number>());
  const clearTypingTimeout = (userId: string) => {
    const timeoutId = typingTimeoutIdMap.value.get(userId);
    if (timeoutId) {
      typingTimeoutIdMap.value.delete(userId);
      window.clearTimeout(timeoutId);
    }
  };
  let watchHandle: undefined | WatchHandle;

  useCreateTyping();

  onMounted(() => {
    watchHandle = watchImmediate(currentRoomId, (roomId) => {
      if (!roomId) return;

      const createTypingUnsubscribable = $trpc.message.onCreateTyping.subscribe(
        { roomId },
        {
          onData: (data) => {
            clearTypingTimeout(data.userId);

            const id = window.setTimeout(() => {
              typings.value = typings.value.filter(({ userId }) => userId !== data.userId);
              clearTypingTimeout(data.userId);
            }, dayjs.duration(3, "seconds").asMilliseconds());

            typingTimeoutIdMap.value.set(data.userId, id);
            if (!typings.value.some(({ userId }) => userId === data.userId)) typings.value.push(data);
          },
        },
      );

      return () => {
        createTypingUnsubscribable.unsubscribe();
        for (const userId of typingTimeoutIdMap.value.keys()) clearTypingTimeout(userId);
        typings.value = [];
      };
    });
  });

  onUnmounted(() => {
    watchHandle?.();
  });
};
