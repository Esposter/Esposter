import type { Unsubscribable } from "@trpc/server/observable";

import { useEmojiStore } from "@/store/esbabbler/emoji";
import { useRoomStore } from "@/store/esbabbler/room";

export const useEmojiSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const emojiStore = useEmojiStore();
  const { storeCreateEmoji, storeDeleteEmoji, storeUpdateEmoji } = emojiStore;

  const createEmojiUnsubscribable = ref<Unsubscribable>();
  const updateEmojiUnsubscribable = ref<Unsubscribable>();
  const deleteEmojiUnsubscribable = ref<Unsubscribable>();

  onMounted(() => {
    if (!currentRoomId.value) return;

    const roomId = currentRoomId.value;
    createEmojiUnsubscribable.value = $trpc.emoji.onCreateEmoji.subscribe(
      { roomId },
      {
        onData: (data) => {
          storeCreateEmoji(data);
        },
      },
    );
    updateEmojiUnsubscribable.value = $trpc.emoji.onUpdateEmoji.subscribe(
      { roomId },
      {
        onData: (data) => {
          storeUpdateEmoji(data);
        },
      },
    );
    deleteEmojiUnsubscribable.value = $trpc.emoji.onDeleteEmoji.subscribe(
      { roomId },
      {
        onData: (data) => {
          storeDeleteEmoji(data);
        },
      },
    );
  });

  onUnmounted(() => {
    createEmojiUnsubscribable.value?.unsubscribe();
    updateEmojiUnsubscribable.value?.unsubscribe();
    deleteEmojiUnsubscribable.value?.unsubscribe();
  });
};
