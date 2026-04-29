import { useBookmarkStore } from "@/store/message/bookmark";

export const useReadBookmarks = () => {
  const { $trpc } = useNuxtApp();
  const bookmarkStore = useBookmarkStore();
  const { readItems, readMoreItems } = bookmarkStore;
  const readBookmarks = () => readItems(() => $trpc.bookmark.readBookmarks.query({}));
  const readMoreBookmarks = (onComplete: () => void) =>
    readMoreItems((cursor) => $trpc.bookmark.readBookmarks.query({ cursor }), onComplete);
  return { readBookmarks, readMoreBookmarks };
};
