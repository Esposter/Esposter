import { getUnsubscribe } from "@/services/shared/getUnsubscribe";
import { useEmojiStore } from "@/store/message/emoji";
import { useRoomStore } from "@/store/message/room";

export const useEmojiSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const emojiStore = useEmojiStore();
  const { storeCreateEmoji, storeDeleteEmoji, storeUpdateEmoji } = emojiStore;

  useOnlineSubscribable(currentRoomId, (roomId) => {
    if (!roomId) return undefined;

    return getUnsubscribe(
      $trpc.message.emoji.onCreateEmoji.subscribe(
        { roomId },
        {
          onData: (newEmoji) => {
            storeCreateEmoji(newEmoji);
          },
        },
      ),
      $trpc.message.emoji.onUpdateEmoji.subscribe(
        { roomId },
        {
          onData: (updatedEmoji) => {
            storeUpdateEmoji(updatedEmoji);
          },
        },
      ),
      $trpc.message.emoji.onDeleteEmoji.subscribe(
        { roomId },
        {
          onData: (id) => {
            storeDeleteEmoji(id);
          },
        },
      ),
    );
  });
};
