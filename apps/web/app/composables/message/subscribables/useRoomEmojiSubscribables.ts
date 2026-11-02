import { getUnsubscribe } from "@/services/shared/getUnsubscribe";
import { useRoomStore } from "@/store/message/room";
import { useRoomEmojiStore } from "@/store/message/room/emoji";

export const useRoomEmojiSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const roomEmojiStore = useRoomEmojiStore();
  const { readRoomEmojis, storeCreateRoomEmoji, storeDeleteRoomEmoji, storeUpdateRoomEmoji } = roomEmojiStore;

  useOnlineSubscribable(currentRoomId, async (roomId) => {
    if (!roomId) return undefined;
    // The subscription owns every remote-visible transition: an emoji an admin adds has to reach the picker and
    // The message renderer of everyone already in the room, or a message using it renders its fallback until
    // They next open it. It opens before the read, which replays what it delivers over the answer
    const unsubscribe = getUnsubscribe(
      $trpc.room.emoji.onCreateRoomEmoji.subscribe(
        { roomId },
        {
          onData: (newRoomEmoji) => {
            storeCreateRoomEmoji(roomId, newRoomEmoji);
          },
        },
      ),
      $trpc.room.emoji.onDeleteRoomEmoji.subscribe(
        { roomId },
        {
          onData: ({ id }) => {
            storeDeleteRoomEmoji(roomId, { id });
          },
        },
      ),
      $trpc.room.emoji.onUpdateRoomEmoji.subscribe(
        { roomId },
        {
          onData: (updatedRoomEmoji) => {
            storeUpdateRoomEmoji(roomId, updatedRoomEmoji);
          },
        },
      ),
    );
    await readRoomEmojis(roomId);
    return unsubscribe;
  });
};
