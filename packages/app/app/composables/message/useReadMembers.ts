import type { User } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";
import { useRoleStore } from "@/store/message/room/role";
import { useMemberStore } from "@/store/message/user/member";
import { StandardMessageEntityPropertyNames } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const useReadMembers = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const memberStore = useMemberStore();
  const { readItems, readMoreItems } = memberStore;
  const { count, memberMap } = storeToRefs(memberStore);
  const readUserStatuses = useReadUserStatuses();
  const roleStore = useRoleStore();
  const { readMemberRoles } = roleStore;
  const readMetadata = (roomId: string, memberIds: User["id"][]) => {
    if (memberIds.length === 0) return Promise.resolve();
    return Promise.all([readUserStatuses(memberIds), readMemberRoles({ roomId, userIds: memberIds })]);
  };
  const readMembers = () =>
    readItems(
      async () => {
        if (!currentRoomId.value)
          throw new InvalidOperationError(
            Operation.Read,
            readMoreMembers.name,
            StandardMessageEntityPropertyNames.partitionKey,
          );
        count.value = await $trpc.room.countMembers.query({ roomId: currentRoomId.value });
        return $trpc.room.readMembers.query({ roomId: currentRoomId.value });
      },
      async ({ items }) => {
        if (!currentRoomId.value)
          throw new InvalidOperationError(
            Operation.Read,
            readMoreMembers.name,
            StandardMessageEntityPropertyNames.partitionKey,
          );
        for (const member of items) memberMap.value.set(member.id, member);
        await readMetadata(
          currentRoomId.value,
          items.map(({ id }) => id),
        );
      },
    );
  const readMoreMembers = (onComplete: () => void) =>
    readMoreItems(async (cursor) => {
      if (!currentRoomId.value)
        throw new InvalidOperationError(
          Operation.Read,
          readMoreMembers.name,
          StandardMessageEntityPropertyNames.partitionKey,
        );
      const cursorPaginationData = await $trpc.room.readMembers.query({ cursor, roomId: currentRoomId.value });
      for (const member of cursorPaginationData.items) memberMap.value.set(member.id, member);
      await readMetadata(
        currentRoomId.value,
        cursorPaginationData.items.map(({ id }) => id),
      );
      return cursorPaginationData;
    }, onComplete);
  return { readMembers, readMoreMembers };
};
