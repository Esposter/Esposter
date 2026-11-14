import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { useConnectionStore } from "@/store/realtime/connection";

export const useTypingEvents = () => {
  const dataStore = useDataStore();
  const { typings } = storeToRefs(dataStore);
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const connectionStore = useConnectionStore();
  const { onRoomEvent } = connectionStore;
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

  onScopeDispose(
    onRoomEvent("createTyping", (typing, roomId) => {
      // A typing frame that arrives after the reader has left its room is not the room on screen's
      if (roomId !== currentRoomId.value) return;

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
    }),
  );
};
