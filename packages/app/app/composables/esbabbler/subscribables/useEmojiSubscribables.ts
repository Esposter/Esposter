import type { DeleteEmojiInput } from "#shared/models/esbabbler/message/metadata/DeleteEmojiInput";
import type { MessageEmojiMetadataEntity } from "#shared/models/esbabbler/message/metadata/MessageEmojiMetadataEntity";
import type { UpdateEmojiInput } from "#shared/models/esbabbler/message/metadata/UpdateEmojiInput";
import type { Unsubscribable } from "@trpc/server/observable";

import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { useEmojiStore } from "@/store/esbabbler/emoji";
import { useRoomStore } from "@/store/esbabbler/room";

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
        onData: (data: MessageEmojiMetadataEntity) => {
          getSynchronizedFunction(() => createEmoji(data))();
        },
      },
    );
    updateEmojiUnsubscribable.value = $client.emoji.onUpdateEmoji.subscribe(
      { roomId: currentRoomId.value },
      {
        onData: (data: UpdateEmojiInput) => {
          getSynchronizedFunction(() => updateEmoji(data))();
        },
      },
    );
    deleteEmojiUnsubscribable.value = $client.emoji.onDeleteEmoji.subscribe(
      { roomId: currentRoomId.value },
      {
        onData: (data: DeleteEmojiInput) => {
          getSynchronizedFunction(() => deleteEmoji(data))();
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
