import { MessageEntityPropertyNames } from "#shared/models/db/message/MessageEntity";
import { useMessageStore } from "@/store/message";
import { useMemberStore } from "@/store/message/member";
import { useRoomStore } from "@/store/message/room";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const useReadMembers = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const memberStore = useMemberStore();
  const { readItems, readMoreItems } = memberStore;
  const messageStore = useMessageStore();
  const { userMap } = storeToRefs(messageStore);
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
        for (const user of items) userMap.value.set(user.id, user);
        await readMetadata(items.map(({ id }) => id));
      },
    );
  const readMoreMembers = () =>
    readMoreItems(async (cursor) => {
      if (!currentRoomId.value)
        throw new InvalidOperationError(Operation.Read, readMoreMembers.name, MessageEntityPropertyNames.partitionKey);
      const cursorPaginationData = await $trpc.room.readMembers.query({ cursor, roomId: currentRoomId.value });
      for (const user of cursorPaginationData.items) userMap.value.set(user.id, user);
      await readMetadata(cursorPaginationData.items.map(({ id }) => id));
      return cursorPaginationData;
    });
  return { readMembers, readMoreMembers };
};
