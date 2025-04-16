import type { User } from "#shared/db/schema/users";

import { useRoomStore } from "@/store/esbabbler/room";

export const useReadCreators = (creatorMap: Ref<Map<string, User>>) => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  return async (userIds: string[]) => {
    if (!currentRoomId.value) return;

    const creatorIds = userIds.filter((id) => !creatorMap.value.has(id));
    if (creatorIds.length === 0) return;

    const creators = await $trpc.room.readMembersByIds.query({ ids: creatorIds, roomId: currentRoomId.value });
    for (const creator of creators) creatorMap.value.set(creator.id, creator);
  };
};
