import type { ToggleBookmarkInput } from "#shared/models/db/bookmark/ToggleBookmarkInput";
import type { Entry } from "#src/models/shared/overlay/Entry";

import { getBookmarkTarget } from "#shared/services/bookmark/getBookmarkTarget";
import { bookmarkTable } from "#src/services/bookmark/overlay/constants";

// The bookmark a toggle makes is the row the entry writes: a live one for a page not bookmarked, the tombstone lifted
// For A page whose removal the reader holds. The server's row confirms it
export const getToggleBookmarkEntry =
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
