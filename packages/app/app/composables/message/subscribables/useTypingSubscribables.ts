import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";

export const useTypingSubscribables = async () => {
  const onlineSubscribableContext = getOnlineSubscribableContext();
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

  await useCreateTyping();

  useOnlineSubscribable(
    currentRoomId,
    (roomId) => {
      if (!roomId) return undefined;

      const createTypingUnsubscribable = $trpc.message.onCreateTyping.subscribe(
        { roomId },
        {
          onData: (typing) => {
            clearTypingTimeout(typing.userId);

            const timeoutId = window.setTimeout(
              () => {
                typings.value = typings.value.filter(({ userId }) => userId !== typing.userId);
                clearTypingTimeout(typing.userId);
              },
              Temporal.Duration.from({ seconds: 3 }).total("milliseconds"),
            );

            typingTimeoutIdMap.value.set(typing.userId, timeoutId);
            if (!typings.value.some(({ userId }) => userId === typing.userId)) typings.value.push(typing);
          },
        },
      );

      return () => {
        createTypingUnsubscribable.unsubscribe();
        for (const userId of typingTimeoutIdMap.value.keys()) clearTypingTimeout(userId);
        typings.value = [];
      };
    },
    onlineSubscribableContext,
  );
};
