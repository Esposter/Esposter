import type { Unsubscribable } from "@trpc/server/observable";

import { useEmojiStore } from "@/store/esbabbler/emoji";
import { useRoomStore } from "@/store/esbabbler/room";
import { getSync } from "@/util/getSync";

export const useEmojiSubscribables = () => {
  const { $client } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const emojiStore = useEmojiStore();
  const { createEmoji, deleteEmoji, updateEmoji } = emojiStore;

  const createEmojiUnsubscribable = ref<Unsubscribable>();
  const updateEmojiUnsubscribable = ref<Unsubscribable>();
  const deleteEmojiUnsubscribable = ref<Unsubscribable>();

  onMounted(() => {
    if (!currentRoomId.value) return;

    createEmojiUnsubscribable.value = $client.emoji.onCreateEmoji.subscribe(
      { roomId: currentRoomId.value },
      {
        onData: (data) =>
          getSync(async () => {
            await createEmoji(data);
          }),
      },
    );
    updateEmojiUnsubscribable.value = $client.emoji.onUpdateEmoji.subscribe(
      { roomId: currentRoomId.value },
      {
        onData: (data) =>
          getSync(async () => {
            await updateEmoji(data);
          }),
      },
    );
    deleteEmojiUnsubscribable.value = $client.emoji.onDeleteEmoji.subscribe(
      { roomId: currentRoomId.value },
      {
        onData: (data) =>
          getSync(async () => {
            await deleteEmoji(data);
          }),
      },
    );
  });

  onUnmounted(() => {
    createEmojiUnsubscribable.value?.unsubscribe();
    updateEmojiUnsubscribable.value?.unsubscribe();
    deleteEmojiUnsubscribable.value?.unsubscribe();
  });
};
