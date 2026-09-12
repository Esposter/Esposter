import { getUnsubscribe } from "@/services/shared/getUnsubscribe";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";

export const useTypingSubscribables = async () => {
  const onlineSubscribableContext = getOnlineSubscribableContext();
  const { $trpc } = useNuxtApp();
  const dataStore = useDataStore();
  const { typings } = storeToRefs(dataStore);
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  // Timer handles only, read by the closures below and rendered nowhere, so a reactive wrapper would proxy the
  // Map for no reader
  const typingTimeoutIdMap = new Map<string, number>();
  const clearTypingTimeout = (userId: string) => {
    const timeoutId = typingTimeoutIdMap.get(userId);
    if (timeoutId) {
      typingTimeoutIdMap.delete(userId);
      window.clearTimeout(timeoutId);
    }
  };

  await useCreateTyping();

  useOnlineSubscribable(
    currentRoomId,
    (roomId) => {
      if (!roomId) return undefined;

      const unsubscribe = getUnsubscribe(
        $trpc.message.onCreateTyping.subscribe(
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

              typingTimeoutIdMap.set(typing.userId, timeoutId);
              if (!typings.value.some(({ userId }) => userId === typing.userId)) typings.value.push(typing);
            },
          },
        ),
      );

      return () => {
        unsubscribe();
        for (const userId of typingTimeoutIdMap.keys()) clearTypingTimeout(userId);
        typings.value = [];
      };
    },
    onlineSubscribableContext,
  );
};
