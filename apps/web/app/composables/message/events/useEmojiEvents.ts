import { useConnectionStore } from "@/store/realtime/connection";
import { useEmojiStore } from "@/store/message/emoji";

export const useEmojiEvents = () => {
  const emojiStore = useEmojiStore();
  const { storeDeleteEmoji, storeEmoji } = emojiStore;
  const connectionStore = useConnectionStore();
  const { onRoomEvent } = connectionStore;

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
  onScopeDispose(
    onRoomEvent("deleteEmoji", (deletedEmoji, roomId) => {
      storeDeleteEmoji(roomId, deletedEmoji);
    }),
  );
};
