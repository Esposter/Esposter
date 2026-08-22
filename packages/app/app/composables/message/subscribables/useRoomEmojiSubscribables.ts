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

    // The room's set is read here rather than in a watcher of its own: one room-scoped lifecycle owns both
    // Halves, so the list is in place before the subscription that keeps it current can deliver anything
    await readRoomEmojis(roomId);

    // The subscription owns every remote-visible transition: an emoji an admin adds has to reach the picker and
    // The message renderer of everyone already in the room, or a message using it renders its fallback until
    // They next open it
    const createRoomEmojiUnsubscribable = $trpc.room.emoji.onCreateRoomEmoji.subscribe(
      { roomId },
      {
        onData: (newRoomEmoji) => {
          storeCreateRoomEmoji(newRoomEmoji);
        },
      },
    );
    const deleteRoomEmojiUnsubscribable = $trpc.room.emoji.onDeleteRoomEmoji.subscribe(
      { roomId },
      {
        onData: ({ id }) => {
          storeDeleteRoomEmoji({ id });
        },
      },
    );
    const updateRoomEmojiUnsubscribable = $trpc.room.emoji.onUpdateRoomEmoji.subscribe(
      { roomId },
      {
        onData: (updatedRoomEmoji) => {
          storeUpdateRoomEmoji(updatedRoomEmoji);
        },
      },
    );

    return () => {
      createRoomEmojiUnsubscribable.unsubscribe();
      deleteRoomEmojiUnsubscribable.unsubscribe();
      updateRoomEmojiUnsubscribable.unsubscribe();
    };
  });
};
