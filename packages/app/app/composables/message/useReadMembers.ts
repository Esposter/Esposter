import { useMemberStore } from "@/store/message/member";
import { useRoomStore } from "@/store/message/room";
import { MessageEntityPropertyNames } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const useReadMembers = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId, memberMap } = storeToRefs(roomStore);
  const memberStore = useMemberStore();
  const { readItems, readMoreItems } = memberStore;
  const readUserStatuses = useReadUserStatuses();
  const readMetadata = (userIds: string[]) => readUserStatuses(userIds);
  const readMembers = () =>
    readItems(
      () => {
        if (!currentRoomId.value)
          throw new InvalidOperationError(
            Operation.Read,
            readMoreMembers.name,
            MessageEntityPropertyNames.partitionKey,
          );
        return $trpc.room.readMembers.useQuery({ roomId: currentRoomId.value });
      },
      async ({ items }) => {
        for (const user of items) memberMap.value.set(user.id, user);
        await readMetadata(items.map(({ id }) => id));
      },
    );
  const readMoreMembers = (onComplete: () => void) =>
    readMoreItems(async (cursor) => {
      if (!currentRoomId.value)
        throw new InvalidOperationError(Operation.Read, readMoreMembers.name, MessageEntityPropertyNames.partitionKey);
      const cursorPaginationData = await $trpc.room.readMembers.query({ cursor, roomId: currentRoomId.value });
      for (const member of cursorPaginationData.items) memberMap.value.set(member.id, member);
      await readMetadata(cursorPaginationData.items.map(({ id }) => id));
      return cursorPaginationData;
    }, onComplete);
  return { readMembers, readMoreMembers };
};
