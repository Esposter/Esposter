import { useMessageStore } from "@/store/message";
import { useRoomStore } from "@/store/message/room";

export const useReadUsers = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const messageStore = useMessageStore();
  const { userMap } = storeToRefs(messageStore);
  return async (userIds: string[]) => {
    if (!currentRoomId.value) return;

    const ids = userIds.filter((id) => !userMap.value.has(id));
    if (ids.length === 0) return;

    const users = await $trpc.room.readMembersByIds.query({ ids, roomId: currentRoomId.value });
    for (const user of users) userMap.value.set(user.id, user);
  };
};
