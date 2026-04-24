import type { User } from "@esposter/db-schema";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { MemberCacheStoreConfiguration } from "@/services/cache/indexedDb/configurations/MemberCacheStoreConfiguration";
import { readCached } from "@/services/cache/indexedDb/readCached";
import { writeCached } from "@/services/cache/indexedDb/writeCached";
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
  const online = useOnline();
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
        if (!online.value) {
          const cachedEntries = await readCached<User & { partitionKey: string }>(
            MemberCacheStoreConfiguration,
            roomId,
          );
          const cachedData = new CursorPaginationData<User>();
          cachedData.items = cachedEntries.map(({ partitionKey: _partitionKey, ...member }) => member as User);
          return cachedData;
        }
        count.value = await $trpc.room.countMembers.query({ roomId });
        const result = await $trpc.room.readMembers.query({ roomId });
        await writeCached(
          MemberCacheStoreConfiguration,
          result.items.map((member) => ({ ...member, partitionKey: roomId })),
          roomId,
        );
        return result;
      },
      async ({ items }) => {
        for (const member of items) memberMap.value.set(member.id, member);
        await readMetadata(
          roomId,
          items.map(({ id }) => id),
        );
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
