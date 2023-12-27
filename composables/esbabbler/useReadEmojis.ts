import { useEmojiStore } from "@/store/esbabbler/emoji";
import { useRoomStore } from "@/store/esbabbler/room";

export const useReadEmojis = () => {
  const { $client } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const emojiStore = useEmojiStore();
  const { pushEmojiMap } = emojiStore;
  return async (messageRowKeys: string[]) => {
    if (!currentRoomId.value) return;

    const emojis = await $client.emoji.readEmojis.query({ roomId: currentRoomId.value, messageRowKeys });
    pushEmojiMap(messageRowKeys, emojis);
  };
};
