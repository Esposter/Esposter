import type { User } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";
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
  const readMetadata = (memberIds: User["id"][]) => readUserStatuses(memberIds);
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
        return $trpc.room.readMembers.useQuery({ roomId: currentRoomId.value });
      },
      ({ items }) => {
        for (const member of items) memberMap.value.set(member.id, member);
        readMetadata(items.map(({ id }) => id));
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
      await readMetadata(cursorPaginationData.items.map(({ id }) => id));
      return cursorPaginationData;
    }, onComplete);
  return { readMembers, readMoreMembers };
};
