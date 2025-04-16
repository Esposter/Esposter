import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { useMessageStore } from "@/store/esbabbler/message";
import { useRoomStore } from "@/store/esbabbler/room";

export const useReadCreators = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const messageStore = useMessageStore();
  const { creatorMap } = storeToRefs(messageStore);
  return async (messages: MessageEntity[]) => {
    if (!currentRoomId.value) return;

    const creators = messages.filter(({ userId }) => !creatorMap.value.has(userId));
    if (creators.length === 0) return;

    const membersByIds = await $trpc.room.readMembersByIds.query({
      ids: creators.map(({ userId }) => userId),
      roomId: currentRoomId.value,
    });
    for (const memberById of membersByIds) creatorMap.value.set(memberById.id, memberById);
  };
};
