import type { Unsubscribable } from "@trpc/server/observable";

import { dayjs } from "#shared/services/dayjs";
import { useMessageStore } from "@/store/esbabbler/message";
import { useRoomStore } from "@/store/esbabbler/room";

export const useTypingSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const messageStore = useMessageStore();
  const { typings } = storeToRefs(messageStore);
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

  const createTypingUnsubscribable = ref<Unsubscribable>();

  useCreateTyping();

  onMounted(() => {
    if (!currentRoomId.value) return;

    const roomId = currentRoomId.value;
    createTypingUnsubscribable.value = $trpc.message.onCreateTyping.subscribe(
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
  });

  onUnmounted(() => {
    createTypingUnsubscribable.value?.unsubscribe();
    for (const userId of typingTimeoutIdMap.value.keys()) clearTypingTimeout(userId);
    typings.value = [];
  });
};
