import { TYPING_WINDOW_MS } from "#src/services/message/constants";
import { useDataStore } from "#src/store/message/data";
import { useRoomStore } from "#src/store/message/room/index";
import { useConnectionStore } from "#src/store/realtime/connection";

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

  // A removal timer left pending would fire after the scope is gone, so the scope takes every one of them with it
  onScopeDispose(() => {
    for (const timeoutId of typingTimeoutIdMap.values()) window.clearTimeout(timeoutId);
    typingTimeoutIdMap.clear();
  });
  onScopeDispose(
    onRoomEvent("createTyping", (typing, roomId) => {
      // A typing frame that arrives after the reader has left its room is not the room on screen's
      if (roomId !== currentRoomId.value) return;

      clearTypingTimeout(typing.userId);

      const timeoutId = window.setTimeout(() => {
        typings.value = typings.value.filter(({ userId }) => userId !== typing.userId);
        clearTypingTimeout(typing.userId);
      }, TYPING_WINDOW_MS);

      typingTimeoutIdMap.set(typing.userId, timeoutId);
      if (!typings.value.some(({ userId }) => userId === typing.userId)) typings.value.push(typing);
    }),
  );
};
