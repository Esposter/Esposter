import { useEmojiStore } from "@/store/message/emoji";
import { useRoomStore } from "@/store/message/room";

export const useEmojiSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const emojiStore = useEmojiStore();
  const { storeCreateEmoji, storeDeleteEmoji, storeUpdateEmoji } = emojiStore;

  watchImmediate(currentRoomId, (roomId) => {
    if (!roomId) return;

    const createEmojiUnsubscribable = $trpc.emoji.onCreateEmoji.subscribe(
      { roomId },
      {
        onData: (data) => {
          storeCreateEmoji(data);
        },
      },
    );
    const updateEmojiUnsubscribable = $trpc.emoji.onUpdateEmoji.subscribe(
      { roomId },
      {
        onData: (data) => {
          storeUpdateEmoji(data);
        },
      },
    );
    const deleteEmojiUnsubscribable = $trpc.emoji.onDeleteEmoji.subscribe(
      { roomId },
      {
        onData: (data) => {
          storeDeleteEmoji(data);
        },
      },
    );

    return () => {
      createEmojiUnsubscribable.unsubscribe();
      updateEmojiUnsubscribable.unsubscribe();
      deleteEmojiUnsubscribable.unsubscribe();
    };
  });
};
