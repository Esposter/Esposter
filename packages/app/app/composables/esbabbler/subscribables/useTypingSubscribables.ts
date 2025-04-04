import type { Unsubscribable } from "@trpc/server/observable";

import { dayjs } from "#shared/services/dayjs";
import { useMessageStore } from "@/store/esbabbler/message";
import { useRoomStore } from "@/store/esbabbler/room";

interface TypingTimeout {
  id: number;
  userId: string;
}

export const useTypingSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const messageStore = useMessageStore();
  const { typingList } = storeToRefs(messageStore);
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const typingTimeouts = ref<TypingTimeout[]>([]);
  const clearTypingTimeout = (userId: string) => {
    const timeout = typingTimeouts.value.find((t) => t.userId === userId);
    if (timeout) window.clearTimeout(timeout.id);
  };

  const createTypingUnsubscribable = ref<Unsubscribable>();

  const unsubscribe = () => {
    for (const { userId } of typingTimeouts.value) clearTypingTimeout(userId);
    createTypingUnsubscribable.value?.unsubscribe();
  };

  useCreateTyping();

  watch(currentRoomId, (newRoomId, oldRoomId) => {
    if (oldRoomId) unsubscribe();
    if (!newRoomId) return;

    createTypingUnsubscribable.value = $trpc.message.onCreateTyping.subscribe(
      { roomId: newRoomId },
      {
        onData: (data) => {
          clearTypingTimeout(data.userId);

          const id = window.setTimeout(() => {
            typingList.value = typingList.value.filter(({ userId }) => userId !== data.userId);
            clearTypingTimeout(data.userId);
          }, dayjs.duration(3, "seconds").asMilliseconds());

          typingTimeouts.value.push({ id, userId: data.userId });
          if (!typingList.value.some(({ userId }) => userId === data.userId)) typingList.value.push(data);
        },
      },
    );
  });

  onUnmounted(() => {
    unsubscribe();
  });
};
