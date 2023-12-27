import { useEmojiStore } from "@/store/esbabbler/emoji";
import { useRoomStore } from "@/store/esbabbler/room";
import { type Unsubscribable } from "@trpc/server/observable";

export const useEmojiSubscribables = () => {
  const { $client } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const emojiStore = useEmojiStore();
  const { createEmoji, updateEmoji, deleteEmoji } = emojiStore;

  const createEmojiUnsubscribable = ref<Unsubscribable>();
  const updateEmojiUnsubscribable = ref<Unsubscribable>();
  const deleteEmojiUnsubscribable = ref<Unsubscribable>();

  onMounted(() => {
    if (!currentRoomId.value) return;

    createEmojiUnsubscribable.value = $client.emoji.onCreateEmoji.subscribe(
      { roomId: currentRoomId.value },
      { onData: (data) => createEmoji(data) },
    );
    updateEmojiUnsubscribable.value = $client.emoji.onUpdateEmoji.subscribe(
      { roomId: currentRoomId.value },
      { onData: (data) => updateEmoji(data) },
    );
    deleteEmojiUnsubscribable.value = $client.emoji.onDeleteEmoji.subscribe(
      { roomId: currentRoomId.value },
      { onData: (data) => deleteEmoji(data) },
    );
  });

  onUnmounted(() => {
    createEmojiUnsubscribable.value?.unsubscribe();
    updateEmojiUnsubscribable.value?.unsubscribe();
    deleteEmojiUnsubscribable.value?.unsubscribe();
  });
};
