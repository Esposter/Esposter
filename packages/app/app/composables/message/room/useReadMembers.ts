import type { User } from "@esposter/db-schema";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { MemberIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MemberIndexedDbStoreConfiguration";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { useRoomStore } from "@/store/message/room";
import { useRoleStore } from "@/store/message/room/role";
import { useUserStore } from "@/store/message/user";
import { useMemberStore } from "@/store/message/user/member";
import { CompositeKeyPropertyNames } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

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
  const online = useOnline();
  const readMetadata = (roomId: string, memberIds: User["id"][]) => {
    if (memberIds.length === 0) return Promise.resolve();
    return Promise.all([
      readUserStatuses(memberIds),
      readMemberRoles({ roomId, userIds: memberIds }),
      readNicknames(roomId, memberIds),
    ]);
  };
  const readMembers = () => {
    const roomId = currentRoomId.value;
    if (!roomId)
      throw new InvalidOperationError(Operation.Read, readMembers.name, CompositeKeyPropertyNames.partitionKey);
    return readItems(
      async () => {
        if (!online.value) {
          const cachedData = new CursorPaginationData<User>();
          cachedData.items = await readIndexedDb(MemberIndexedDbStoreConfiguration, roomId);
          count.value = cachedData.items.length;
          return cachedData;
        }

        count.value = await $trpc.room.countMembers.query({ roomId });
        return $trpc.room.readMembers.query({ roomId });
      },
      async ({ items }) => {
        storeUsers(items);
        if (!online.value) return;
        await readMetadata(
          roomId,
          items.map(({ id }) => id),
        );
      },
    );
  };
  const readMoreMembers = (onComplete: () => void) => {
    const roomId = currentRoomId.value;
    if (!roomId)
      throw new InvalidOperationError(Operation.Read, readMoreMembers.name, CompositeKeyPropertyNames.partitionKey);
    return readMoreItems(async (cursor) => {
      const cursorPaginationData = await $trpc.room.readMembers.query({ cursor, roomId });
      storeUsers(cursorPaginationData.items);
      await readMetadata(
        roomId,
        cursorPaginationData.items.map(({ id }) => id),
      );
      return cursorPaginationData;
    }, onComplete);
  };
  return { readMembers, readMoreMembers };
};
