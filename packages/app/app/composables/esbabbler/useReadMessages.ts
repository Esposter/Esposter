import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { useMessageStore } from "@/store/esbabbler/message";
import { useRoomStore } from "@/store/esbabbler/room";

export const useReadMessages = async () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const messageStore = useMessageStore();
  const { initializeCursorPaginationData, pushMessages } = messageStore;
  const { hasMore, nextCursor } = storeToRefs(messageStore);
  const readUsers = useReadUsers();
  const readReplies = useReadReplies();
  const readFiles = useReadFiles();
  const readEmojis = useReadEmojis();
  const readMetadata = (messages: MessageEntity[]) =>
    Promise.all([
      readUsers(messages.map(({ userId }) => userId)),
      readReplies([
        ...new Set(messages.map(({ replyRowKey }) => replyRowKey).filter((value): value is string => Boolean(value))),
      ]),
      readFiles(messages.flatMap(({ files }) => files)),
      readEmojis(messages.map(({ rowKey }) => rowKey)),
    ]);
  const readMoreMessages = async (onComplete: () => void) => {
    try {
      if (!currentRoomId.value) return;

      const {
        hasMore: newHasMore,
        items,
        nextCursor: newNextCursor,
      } = await $trpc.message.readMessages.query({
        cursor: nextCursor.value,
        roomId: currentRoomId.value,
      });
      nextCursor.value = newNextCursor;
      hasMore.value = newHasMore;
      await readMetadata(items);
      pushMessages(...items);
    } finally {
      onComplete();
    }
  };

  if (currentRoomId.value) {
    const response = await $trpc.message.readMessages.query({ roomId: currentRoomId.value });
    await readMetadata(response.items);
    initializeCursorPaginationData(response);
  }

  return readMoreMessages;
};
