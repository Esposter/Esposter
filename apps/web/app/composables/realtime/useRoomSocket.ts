import { getNewestMessageId } from "@/services/message/getNewestMessageId";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { useRoomEmojiStore } from "@/store/message/room/emoji";
import { useConnectionStore } from "@/store/realtime/connection";

// The socket of the room on screen, open while that room is the current one. It opens before the room's messages are read.
// So a change made while the read is in flight arrives over the socket rather than in the gap between the two.
// A reconnect replays from the newest message the page holds, then re-reads the loaded window.
// That is needed because an edit or a delete made while the socket was closed is not replayed
export const useRoomSocket = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const connectionStore = useConnectionStore();
  const { closeRoom, openRoom } = connectionStore;
  const dataStore = useDataStore();
  const { typings } = storeToRefs(dataStore);
  const { getSlice, refreshLoadedMessages } = dataStore;
  const roomEmojiStore = useRoomEmojiStore();
  const { readRoomEmojis } = roomEmojiStore;
  const onlineSubscribableContext = getOnlineSubscribableContext();

  useOnlineSubscribable(
    currentRoomId,
    async (roomId) => {
      if (!roomId) return undefined;

      await openRoom(
        roomId,
        () => getNewestMessageId(getSlice(roomId).items.value),
        () => {
          refreshLoadedMessages(roomId);
        },
      );
      // A room emoji has no replay, so the read that lists them is issued once the socket's first attempt has settled
      await readRoomEmojis(roomId);
      return () => {
        closeRoom();
        // The typing indicator is the room's own, so the room it was for leaving clears it
        typings.value = [];
      };
    },
    onlineSubscribableContext,
  );
};
