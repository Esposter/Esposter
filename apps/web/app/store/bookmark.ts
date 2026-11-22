import type { BookmarkPageLink } from "#shared/models/app/BookmarkPageLink";
import type { ToggleBookmarkInput } from "#shared/models/db/bookmark/ToggleBookmarkInput";
import type { BookmarkLink } from "#src/models/bookmark/BookmarkLink";
import type { BookmarkInApp } from "@esposter/db-schema";

import { compareCreatedAt } from "#shared/util/date/compareCreatedAt";
import { bookmarkTable } from "#src/services/bookmark/overlay/constants";
import { getToggleBookmarkEntry } from "#src/services/bookmark/overlay/getToggleBookmarkEntry";
import { createArrival } from "#src/services/shared/overlay/createArrival";
import { useNotificationStore } from "#src/store/notification";
import { useOverlayStore } from "#src/store/overlay";

// Server-side, so a reader's bookmarks follow them between devices; a reader who is not signed in has none
export const useBookmarkStore = defineStore("bookmark", () => {
  const { $trpc } = useNuxtApp();
  const userId = useSessionUserId();
  const notificationStore = useNotificationStore();
  const { createErrorNotification } = notificationStore;
  const overlayStore = useOverlayStore();
  const { arrive, view, writeOptimistic } = overlayStore;
  const bookmarkRows = view(bookmarkTable);
  const pathBookmarkLinkMap = ref(new Map<BookmarkPageLink["path"], BookmarkLink>());
  // The reader's live bookmarks, oldest first as the server lists them, each drawn with the fields its read joined in
  const displayBookmarks = computed<BookmarkPageLink[]>(() =>
    bookmarkRows.value
      .filter(({ deletedAt, userId: rowUserId }) => !deletedAt && rowUserId === userId.value)
      .toSorted(compareCreatedAt)
      .map(({ path, title }) => {
        const link = pathBookmarkLinkMap.value.get(path);
        const isAvailable = link?.isAvailable ?? true;
        return link?.mark ? { isAvailable, mark: link.mark, path, title } : { isAvailable, path, title };
      }),
  );
  const bookmarkPaths = computed(() => new Set(displayBookmarks.value.map(({ path }) => path)));
  const { read: readBookmarks } = useCachedRead(() => $trpc.bookmark.readBookmarks.query(), {
    onError: createErrorNotification,
    onSuccess: (readBookmarkRows) => {
      for (const { isAvailable, mark, ...bookmarkRow } of readBookmarkRows) {
        pathBookmarkLinkMap.value.set(bookmarkRow.path, { isAvailable, mark });
        arrive(bookmarkTable, bookmarkRow);
      }
    },
  });
  const toggleBookmark = (input: ToggleBookmarkInput) => {
    // A bookmark made here names the page the reader is on, which they reach, so it is drawn available with its mark
    // Until a read says otherwise
    pathBookmarkLinkMap.value.set(input.path, { isAvailable: true, mark: input.mark });
    writeOptimistic(
      async () => {
        const bookmark: BookmarkInApp = await $trpc.bookmark.toggleBookmark.mutate(input);
        return { arrivals: [createArrival(bookmarkTable, bookmark)], confirmed: [] };
      },
      { entry: getToggleBookmarkEntry(userId.value, input, new Date()), onError: createErrorNotification },
    );
  };
  return { bookmarkPaths, displayBookmarks, readBookmarks, toggleBookmark };
});
