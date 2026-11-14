import { useConnectionStore } from "@/store/realtime/connection";
import { useRoomEmojiStore } from "@/store/message/room/emoji";

export const useRoomEmojiEvents = () => {
  const roomEmojiStore = useRoomEmojiStore();
  const { storeCreateRoomEmoji, storeDeleteRoomEmoji, storeUpdateRoomEmoji } = roomEmojiStore;
  const connectionStore = useConnectionStore();
  const { onRoomEvent } = connectionStore;

  onScopeDispose(
    onRoomEvent("createRoomEmoji", (newRoomEmoji, roomId) => {
      storeCreateRoomEmoji(roomId, newRoomEmoji);
    }),
  );
  onScopeDispose(
    onRoomEvent("updateRoomEmoji", (updatedRoomEmoji, roomId) => {
      storeUpdateRoomEmoji(roomId, updatedRoomEmoji);
    }),
  );
  onScopeDispose(
    onRoomEvent("deleteRoomEmoji", ({ id }, roomId) => {
      storeDeleteRoomEmoji(roomId, { id });
    }),
  );
};
