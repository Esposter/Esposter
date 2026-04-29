import type { BookmarkEntity } from "@esposter/db-schema";

export const useBookmarkStore = defineStore("message/bookmark", () => {
  const { $trpc } = useNuxtApp();
  const { hasMore, items, readItems, readMoreItems } = useCursorPaginationData<BookmarkEntity>();

  const isBookmarked = (roomId: string, messageRowKey: string) =>
    items.value.some(({ rowKey }) => rowKey === `${roomId}|${messageRowKey}`);

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
    hasMore,
    isBookmarked,
    items,
    readItems,
    readMoreItems,
  };
});
