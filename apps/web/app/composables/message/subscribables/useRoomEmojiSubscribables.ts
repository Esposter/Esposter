import { getUnsubscribe } from "@/services/shared/getUnsubscribe";
import { subscribeStarted } from "@/services/shared/subscribeStarted";
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
    // They next open it. Each one is started before the read, so the read cannot miss a change its answer leaves out
    const subscriptions = await Promise.all([
      subscribeStarted((handlers) =>
        $trpc.room.emoji.onCreateRoomEmoji.subscribe(
          { roomId },
          {
            onData: (newRoomEmoji) => {
              storeCreateRoomEmoji(roomId, newRoomEmoji);
            },
            ...handlers,
          },
        ),
      ),
      subscribeStarted((handlers) =>
        $trpc.room.emoji.onDeleteRoomEmoji.subscribe(
          { roomId },
          {
            onData: ({ id }) => {
              storeDeleteRoomEmoji(roomId, { id });
            },
            ...handlers,
          },
        ),
      ),
      subscribeStarted((handlers) =>
        $trpc.room.emoji.onUpdateRoomEmoji.subscribe(
          { roomId },
          {
            onData: (updatedRoomEmoji) => {
              storeUpdateRoomEmoji(roomId, updatedRoomEmoji);
            },
            ...handlers,
          },
        ),
      ),
    ]);
    await readRoomEmojis(roomId);
    return getUnsubscribe(...subscriptions);
  });
};
