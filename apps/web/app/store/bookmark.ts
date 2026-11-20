import type { BookmarkPageLink } from "#shared/models/app/BookmarkPageLink";
import type { ToggleBookmarkInput } from "#shared/models/db/bookmark/ToggleBookmarkInput";
import type { Entry } from "#src/models/shared/overlay/Entry";
import type { BookmarkInApp } from "@esposter/db-schema";

import { compareCreatedAt } from "#shared/util/date/compareCreatedAt";
import { getBookmarkTarget } from "#shared/services/bookmark/getBookmarkTarget";
import { createArrival } from "#src/services/shared/overlay/createArrival";
import { createTable } from "#src/services/shared/overlay/createTable";
import { useNotificationStore } from "#src/store/notification";
import { useOverlayStore } from "#src/store/overlay";
import { bookmarksInApp } from "@esposter/db-schema";

// A bookmark row, held by its user and its path
const bookmarkTable = createTable(bookmarksInApp);

// The fields a read joins in from other tables, kept beside the row by its path: whether the page is reachable, and the
// Mark that names it. A row the read did not join is drawn as reachable with no mark
interface BookmarkLink {
  isAvailable?: boolean;
  mark?: BookmarkPageLink["mark"];
}

// The bookmark a toggle makes is the row the entry writes: a live one for a page not bookmarked, the tombstone lifted for
// A page whose removal the reader holds. The server's row confirms it
const getToggleBookmarkEntry =
  (userId: string, input: ToggleBookmarkInput, now: Date): Entry =>
  (view) => {
    const rowKey: [string, string] = [userId, input.path];
    const bookmark = view.get(bookmarkTable, rowKey);
    if (bookmark && !bookmark.deletedAt) {
      view.set(bookmarkTable, rowKey, { ...bookmark, deletedAt: now });
      return;
    }

    view.set(bookmarkTable, rowKey, {
      ...bookmark,
      ...getBookmarkTarget(input.mark),
      createdAt: bookmark?.createdAt ?? now,
      deletedAt: null,
      path: input.path,
      title: input.title,
      updatedAt: now,
      userId,
    });
  };

// Server-side, so a reader's bookmarks follow them between devices; a reader who is not signed in has none
export const useBookmarkStore = defineStore("bookmark", () => {
  const { $trpc } = useNuxtApp();
  const userId = useSessionUserId();
  const notificationStore = useNotificationStore();
  const { createErrorNotification } = notificationStore;
  const overlayStore = useOverlayStore();
  const { arrive, view, writeOptimistic } = overlayStore;
  const bookmarkRows = view(bookmarkTable);
  const bookmarkLinks = ref(new Map<BookmarkPageLink["path"], BookmarkLink>());
  // The reader's live bookmarks, oldest first as the server lists them, each drawn with the fields its read joined in
  const bookmarks = computed<BookmarkPageLink[]>(() =>
    bookmarkRows.value
      .filter(({ deletedAt, userId: rowUserId }) => !deletedAt && rowUserId === userId.value)
      .toSorted(compareCreatedAt)
      .map(({ path, title }) => {
        const link = bookmarkLinks.value.get(path);
        const isAvailable = link?.isAvailable ?? true;
        return link?.mark ? { isAvailable, mark: link.mark, path, title } : { isAvailable, path, title };
      }),
  );
  const bookmarkPaths = computed(() => new Set(bookmarks.value.map(({ path }) => path)));
  const { read: readBookmarks } = useCachedRead(() => $trpc.bookmark.readBookmarks.query(), {
    onError: createErrorNotification,
    onSuccess: (readBookmarkRows) => {
      for (const { isAvailable, mark, ...bookmarkRow } of readBookmarkRows) {
        bookmarkLinks.value.set(bookmarkRow.path, { isAvailable, mark });
        arrive(bookmarkTable, bookmarkRow);
      }
    },
  });
  const toggleBookmark = (input: ToggleBookmarkInput) => {
    // A bookmark made here names the page the reader is on, which they reach, so it is drawn available with its mark
    // Until a read says otherwise
    bookmarkLinks.value.set(input.path, { isAvailable: true, mark: input.mark });
    writeOptimistic(
      async () => {
        const bookmark: BookmarkInApp = await $trpc.bookmark.toggleBookmark.mutate(input);
        return { arrivals: [createArrival(bookmarkTable, bookmark)], confirmed: [] };
      },
      { entry: getToggleBookmarkEntry(userId.value, input, new Date()), onError: createErrorNotification },
    );
  };
  return { bookmarkPaths, bookmarks, readBookmarks, toggleBookmark };
});
