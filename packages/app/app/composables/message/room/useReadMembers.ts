import type { User } from "@esposter/db-schema";

import { requirePartitionKey } from "@/services/message/requirePartitionKey";
import { useRoomStore } from "@/store/message/room";
import { useRoleStore } from "@/store/message/room/role";
import { useUserStore } from "@/store/message/user";
import { useMemberStore } from "@/store/message/user/member";

export const useReadMembers = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const memberStore = useMemberStore();
  const { readItems, readMoreItems } = memberStore;
  const { count } = storeToRefs(memberStore);
  const userStore = useUserStore();
  const { storeUsers } = userStore;
  const readUserStatuses = useReadUserStatuses();
  const roleStore = useRoleStore();
  const { readMemberRoles } = roleStore;
  const readNicknames = useReadNicknames();
  const readMetadata = (roomId: string, memberIds: User["id"][]) => {
    if (memberIds.length === 0) return Promise.resolve();
    return Promise.all([
      readUserStatuses(memberIds),
      readMemberRoles({ roomId, userIds: memberIds }),
      readNicknames(roomId, memberIds),
    ]);
  };
  const readMembers = () => {
    const roomId = requirePartitionKey(currentRoomId.value, readMembers.name);
    return readItems(async () => {
      count.value = await $trpc.room.countMembers.query({ roomId });
      const cursorPaginationData = await $trpc.room.readMembers.query({ roomId });
      await readMetadata(
        roomId,
        cursorPaginationData.items.map(({ id }) => id),
      );
      storeUsers(cursorPaginationData.items);
      return cursorPaginationData;
    });
  };
  const readMoreMembers = (onComplete: () => void) => {
    const roomId = requirePartitionKey(currentRoomId.value, readMoreMembers.name);
    return readMoreItems(async (cursor) => {
      const cursorPaginationData = await $trpc.room.readMembers.query({ cursor, roomId });
      await readMetadata(
        roomId,
        cursorPaginationData.items.map(({ id }) => id),
      );
      storeUsers(cursorPaginationData.items);
      return cursorPaginationData;
    }, onComplete);
  };
  return { readMembers, readMoreMembers };
};
