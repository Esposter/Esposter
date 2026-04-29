import { useBookmarkStore } from "@/store/message/bookmark";

export const useReadBookmarks = () => {
  const { $trpc } = useNuxtApp();
  const bookmarkStore = useBookmarkStore();
  const { readItems, readMoreItems, storeMessages } = bookmarkStore;
  const readBookmarkMessages = async (rowKeys: string[]) => {
    if (rowKeys.length === 0) return;
    const { messages, users } = await $trpc.bookmark.readBookmarkMessages.query({ rowKeys });
    storeMessages(messages, users);
  };
  const readBookmarks = () =>
    readItems(
      () => $trpc.bookmark.readBookmarks.query({}),
      async ({ items }) => readBookmarkMessages(items.map(({ rowKey }) => rowKey)),
    );
  const readMoreBookmarks = (onComplete: () => void) =>
    readMoreItems(async (cursor) => {
      const data = await $trpc.bookmark.readBookmarks.query({ cursor });
      await readBookmarkMessages(data.items.map(({ rowKey }) => rowKey));
      return data;
    }, onComplete);
  return { readBookmarks, readMoreBookmarks };
};
