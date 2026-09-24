import type { PageLink } from "@/models/app/PageLink";

import { useNotificationStore } from "@/store/notification";

// Server-side, so a reader's bookmarks follow them between devices; a reader who is not signed in has none
export const useBookmarkStore = defineStore("bookmark", () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation } = useMutation();
  const notificationStore = useNotificationStore();
  const { createErrorNotification } = notificationStore;
  const bookmarks = ref<PageLink[]>([]);
  const bookmarkPaths = computed(() => new Set(bookmarks.value.map(({ path }) => path)));
  const { read: readBookmarks } = useCachedRead(() => $trpc.bookmark.readBookmarks.query(), {
    onError: createErrorNotification,
    onSuccess: (newBookmarks) => {
      bookmarks.value = newBookmarks.map(({ path, title }) => ({ path, title }));
    },
  });
  const toggleBookmark = async (path: string, title: string) => {
    await executeMutation(() => $trpc.bookmark.toggleBookmark.mutate({ path, title }), {
      // Read when the write is sent rather than at click time: a second click queues behind the first, and the
      // State it rolls back to has to be the one the write ahead of it left
      applyOptimistic: () => {
        const previousBookmark = bookmarks.value.find((bookmark) => bookmark.path === path);
        bookmarks.value = previousBookmark
          ? bookmarks.value.filter((bookmark) => bookmark.path !== path)
          : [...bookmarks.value, { path, title }];
        return () => {
          bookmarks.value = previousBookmark
            ? [...bookmarks.value.filter((bookmark) => bookmark.path !== path), previousBookmark]
            : bookmarks.value.filter((bookmark) => bookmark.path !== path);
        };
      },
      key: path,
      onError: createErrorNotification,
      // The server's answer is the true state: a list gone stale in another tab flips the wrong way optimistically
      onSuccess: (isBookmarked) => {
        if (isBookmarked === bookmarkPaths.value.has(path)) return;

        const remainingBookmarks = bookmarks.value.filter((bookmark) => bookmark.path !== path);
        bookmarks.value = isBookmarked ? [...remainingBookmarks, { path, title }] : remainingBookmarks;
      },
    });
  };
  return { bookmarkPaths, bookmarks, readBookmarks, toggleBookmark };
});
