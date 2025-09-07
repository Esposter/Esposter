import { useEmojiStore } from "@/store/message/emoji";
import { useRoomStore } from "@/store/message/room";

export const useReadEmojis = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const emojiStore = useEmojiStore();
  const { setEmojis } = emojiStore;
  return async (messageRowKeys: string[]) => {
    if (!currentRoomId.value || messageRowKeys.length === 0) return;

    const emojis = await $trpc.emoji.readEmojis.query({ messageRowKeys, roomId: currentRoomId.value });
    for (const messageRowKey of messageRowKeys)
      setEmojis(
        messageRowKey,
        emojis.filter((e) => e.messageRowKey === messageRowKey),
      );
  };
};
