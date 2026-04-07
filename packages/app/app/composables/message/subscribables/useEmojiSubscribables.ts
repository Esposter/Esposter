import { useEmojiStore } from "@/store/message/emoji";
import { useRoomStore } from "@/store/message/room";

export const useEmojiSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const emojiStore = useEmojiStore();
  const { storeCreateEmoji, storeDeleteEmoji, storeUpdateEmoji } = emojiStore;

  useOnlineSubscribable(currentRoomId, (roomId) => {
    if (!roomId) return;

    const createEmojiUnsubscribable = $trpc.emoji.onCreateEmoji.subscribe(
      { roomId },
      {
        onData: (newEmoji) => {
          storeCreateEmoji(newEmoji);
        },
      },
    );
    const updateEmojiUnsubscribable = $trpc.emoji.onUpdateEmoji.subscribe(
      { roomId },
      {
        onData: (updatedEmoji) => {
          storeUpdateEmoji(updatedEmoji);
        },
      },
    );
    const deleteEmojiUnsubscribable = $trpc.emoji.onDeleteEmoji.subscribe(
      { roomId },
      {
        onData: (id) => {
          storeDeleteEmoji(id);
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
