import { useEmojiStore } from "#src/store/message/emoji";
import { useConnectionStore } from "#src/store/realtime/connection";

export const useEmojiEvents = () => {
  const emojiStore = useEmojiStore();
  const { storeEmoji } = emojiStore;
  const connectionStore = useConnectionStore();
  const { onRoomEvent } = connectionStore;

  // A removal is an update too, since the room sends the row with no reactor at its version
  onScopeDispose(
    onRoomEvent("createEmoji", (newEmoji, roomId) => {
      storeEmoji(roomId, newEmoji);
    }),
  );
  onScopeDispose(
    onRoomEvent("updateEmoji", (updatedEmoji, roomId) => {
      storeEmoji(roomId, updatedEmoji);
    }),
  );
};
