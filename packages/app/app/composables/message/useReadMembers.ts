import { useRoomStore } from "@/store/message/room";
import { useMemberStore } from "@/store/message/user/member";
import { StandardMessageEntityPropertyNames } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const useReadMembers = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const memberStore = useMemberStore();
  const { pushMembers, readItems, readMoreItems } = memberStore;
  const readUserStatuses = useReadUserStatuses();
  const readMetadata = (userIds: string[]) => readUserStatuses(userIds);
  const readMembers = () =>
    readItems(
      () => {
        if (!currentRoomId.value)
          throw new InvalidOperationError(
            Operation.Read,
            readMoreMembers.name,
            StandardMessageEntityPropertyNames.partitionKey,
          );
        return $trpc.room.readMembers.useQuery({ roomId: currentRoomId.value });
      },
      async ({ items }) => {
        pushMembers(...items);
        await readMetadata(items.map(({ id }) => id));
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
      pushMembers(...cursorPaginationData.items);
      await readMetadata(cursorPaginationData.items.map(({ id }) => id));
      return cursorPaginationData;
    }, onComplete);
  return { readMembers, readMoreMembers };
};
