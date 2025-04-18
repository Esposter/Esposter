import { useEsbabblerStore } from "@/store/esbabbler";
import { useRoomStore } from "@/store/esbabbler/room";

export const useReadUsers = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const esbabblerStore = useEsbabblerStore();
  const { userMap } = storeToRefs(esbabblerStore);
  return async (userIds: string[]) => {
    if (!currentRoomId.value) return;

    const ids = userIds.filter((id) => !userMap.value.has(id));
    if (ids.length === 0) return;

    const users = await $trpc.room.readMembersByIds.query({ ids, roomId: currentRoomId.value });
    for (const user of users) userMap.value.set(user.id, user);
  };
};
