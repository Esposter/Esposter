import { useConnectionStore } from "@/store/realtime/connection";
import { useEmojiStore } from "@/store/message/emoji";

export const useEmojiEvents = () => {
  const emojiStore = useEmojiStore();
  const { storeCreateEmoji, storeDeleteEmoji, storeUpdateEmoji } = emojiStore;
  const connectionStore = useConnectionStore();
  const { onRoomEvent } = connectionStore;

  onScopeDispose(
    onRoomEvent("createEmoji", (newEmoji, roomId) => {
      storeCreateEmoji(roomId, newEmoji);
    }),
  );
  onScopeDispose(
    onRoomEvent("updateEmoji", (updatedEmoji, roomId) => {
      storeUpdateEmoji(roomId, updatedEmoji);
    }),
  );
  onScopeDispose(
    onRoomEvent("deleteEmoji", (deletedEmoji, roomId) => {
      storeDeleteEmoji(roomId, deletedEmoji);
    }),
  );
};
