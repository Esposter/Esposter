import { useMessageStore } from "@/store/chat/useMessageStore";
import { useRoomStore } from "@/store/chat/useRoomStore";
import type { Unsubscribable } from "@trpc/server/observable";

export const useEmojiSubscribables = () => {
  const { $client } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = $(storeToRefs(roomStore));
  const messageStore = useMessageStore();
  const { updateMessage } = messageStore;

  let createEmojiUnsubscribable = $ref<Unsubscribable>();
  let updateEmojiUnsubscribable = $ref<Unsubscribable>();
  let deleteEmojiUnsubscribable = $ref<Unsubscribable>();

  onMounted(() => {
    if (!currentRoomId) return;

    createEmojiUnsubscribable = $client.emoji.onCreateEmoji.subscribe(
      { partitionKey: currentRoomId },
      { onData: (data) => updateMessage(data) }
    );
    updateEmojiUnsubscribable = $client.emoji.onUpdateEmoji.subscribe(
      { partitionKey: currentRoomId },
      { onData: (data) => updateMessage(data) }
    );
    deleteEmojiUnsubscribable = $client.emoji.onDeleteEmoji.subscribe(
      { partitionKey: currentRoomId },
      { onData: (data) => updateMessage(data) }
    );
  });

  onUnmounted(() => {
    createEmojiUnsubscribable?.unsubscribe();
    updateEmojiUnsubscribable?.unsubscribe();
    deleteEmojiUnsubscribable?.unsubscribe();
  });
};
