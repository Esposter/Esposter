import type { Creator } from "@/models/message/Creator";
import type { BookmarkEntity, MessageEntity, User } from "@esposter/db-schema";

import { MessageType } from "@esposter/db-schema";

export const useBookmarkStore = defineStore("message/bookmark", () => {
  const { $trpc } = useNuxtApp();
  const { hasMore, items, readItems, readMoreItems } = useCursorPaginationData<BookmarkEntity>();
  const bookmarkMessageMap = ref(new Map<string, MessageEntity>());
  const bookmarkMessageCreatorMap = ref(new Map<string, Creator>());
  const displayItems = computed(() =>
    items.value.flatMap(({ rowKey }) => {
      const message = bookmarkMessageMap.value.get(rowKey);
      const creator = bookmarkMessageCreatorMap.value.get(rowKey);
      if (!message || !creator) return [];
      return [{ creator, message, rowKey }];
    }),
  );

  const isBookmarked = (roomId: string, messageRowKey: string) =>
    items.value.some(({ rowKey }) => rowKey === `${roomId}|${messageRowKey}`);

  const storeMessages = (messages: MessageEntity[], users: User[]) => {
    const userMap = new Map(users.map((u) => [u.id, u]));
    for (const message of messages) {
      const bookmarkRowKey = `${message.partitionKey}|${message.rowKey}`;
      bookmarkMessageMap.value.set(bookmarkRowKey, message);
      if (message.type === MessageType.Webhook) bookmarkMessageCreatorMap.value.set(bookmarkRowKey, message.appUser);
      else {
        const creator = userMap.get(message.userId);
        if (creator) bookmarkMessageCreatorMap.value.set(bookmarkRowKey, creator);
      }
    }
  };

  const createBookmark = async (roomId: string, messageRowKey: string) => {
    await $trpc.bookmark.createBookmark.mutate({ messageRowKey, roomId });
    items.value = [...items.value, { partitionKey: "", rowKey: `${roomId}|${messageRowKey}` } as BookmarkEntity];
  };
  const deleteBookmark = async (roomId: string, messageRowKey: string) => {
    await $trpc.bookmark.deleteBookmark.mutate({ messageRowKey, roomId });
    items.value = items.value.filter(({ rowKey }) => rowKey !== `${roomId}|${messageRowKey}`);
  };

  return {
    createBookmark,
    deleteBookmark,
    displayItems,
    hasMore,
    isBookmarked,
    readItems,
    readMoreItems,
    storeMessages,
  };
});
