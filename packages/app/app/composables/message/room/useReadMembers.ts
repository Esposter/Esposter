import type { User } from "@esposter/db-schema";

import { MemberIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MemberIndexedDbStoreConfiguration";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";
import { useRoomStore } from "@/store/message/room";
import { useRoleStore } from "@/store/message/room/role";
import { useMemberStore } from "@/store/message/user/member";
import { CompositeKeyPropertyNames } from "@esposter/db-schema";
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
  const readMembers = () => {
    const roomId = currentRoomId.value;
    if (!roomId)
      throw new InvalidOperationError(Operation.Read, readMembers.name, CompositeKeyPropertyNames.partitionKey);
    return readItems(
      async () => {
        count.value = await $trpc.room.countMembers.query({ roomId });
        return $trpc.room.readMembers.query({ roomId });
      },
      async ({ items }) => {
        for (const member of items) memberMap.value.set(member.id, member);
        await readMetadata(
          roomId,
          items.map(({ id }) => id),
        );
      },
      {
        cache: {
          read: (partitionKey) => readIndexedDb(MemberIndexedDbStoreConfiguration, partitionKey),
          write: (items, partitionKey) => writeIndexedDb(MemberIndexedDbStoreConfiguration, items, partitionKey),
        },
        partitionKey: roomId,
      },
    );
  };
  const readMoreMembers = (onComplete: () => void) =>
    readMoreItems(async (cursor) => {
      const roomId = currentRoomId.value;
      if (!roomId)
        throw new InvalidOperationError(Operation.Read, readMoreMembers.name, CompositeKeyPropertyNames.partitionKey);
      const cursorPaginationData = await $trpc.room.readMembers.query({ cursor, roomId });
      for (const member of cursorPaginationData.items) memberMap.value.set(member.id, member);
      await readMetadata(
        roomId,
        cursorPaginationData.items.map(({ id }) => id),
      );
      return cursorPaginationData;
    }, onComplete);
  return { readMembers, readMoreMembers };
};
