import type { BookmarkEntity } from "@esposter/db-schema";

export const useBookmarkStore = defineStore("message/bookmark", () => {
  const { $trpc } = useNuxtApp();
  const bookmarks = ref<BookmarkEntity[]>([]);
  const isBookmarked = (roomId: string, messageRowKey: string) =>
    bookmarks.value.some(({ rowKey }) => rowKey === `${roomId}|${messageRowKey}`);

  const readBookmarks = async () => {
    bookmarks.value = await $trpc.bookmark.readBookmarks.query({});
  };
  const createBookmark = async (roomId: string, messageRowKey: string) => {
    await $trpc.bookmark.createBookmark.mutate({ messageRowKey, roomId });
    bookmarks.value = [
      ...bookmarks.value,
      { partitionKey: "", rowKey: `${roomId}|${messageRowKey}` } as BookmarkEntity,
    ];
  };
  const deleteBookmark = async (roomId: string, messageRowKey: string) => {
    await $trpc.bookmark.deleteBookmark.mutate({ messageRowKey, roomId });
    bookmarks.value = bookmarks.value.filter(({ rowKey }) => rowKey !== `${roomId}|${messageRowKey}`);
  };
  return {
    bookmarks,
    createBookmark,
    deleteBookmark,
    isBookmarked,
    readBookmarks,
  };
});
