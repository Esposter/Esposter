import type { DeleteEmojiInput } from "#shared/models/db/message/metadata/DeleteEmojiInput";
import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import type { UpdateEmojiInput } from "#shared/models/db/message/metadata/UpdateEmojiInput";
import type { Unsubscribable } from "@trpc/server/observable";

import { useEmojiStore } from "@/store/esbabbler/emoji";
import { useRoomStore } from "@/store/esbabbler/room";

export const useEmojiSubscribables = () => {
  const { $client } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const emojiStore = useEmojiStore();
  const { storeCreateEmoji, storeDeleteEmoji, storeUpdateEmoji } = emojiStore;

  const createEmojiUnsubscribable = ref<Unsubscribable>();
  const updateEmojiUnsubscribable = ref<Unsubscribable>();
  const deleteEmojiUnsubscribable = ref<Unsubscribable>();

  onMounted(() => {
    if (!currentRoomId.value) return;

    createEmojiUnsubscribable.value = $client.emoji.onCreateEmoji.subscribe(
      { roomId: currentRoomId.value },
      {
        onData: (data: MessageEmojiMetadataEntity) => {
          storeCreateEmoji(data);
        },
      },
    );
    updateEmojiUnsubscribable.value = $client.emoji.onUpdateEmoji.subscribe(
      { roomId: currentRoomId.value },
      {
        onData: (data: UpdateEmojiInput) => {
          storeUpdateEmoji(data);
        },
      },
    );
    deleteEmojiUnsubscribable.value = $client.emoji.onDeleteEmoji.subscribe(
      { roomId: currentRoomId.value },
      {
        onData: (data: DeleteEmojiInput) => {
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
