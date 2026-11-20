// @vitest-environment nuxt
import type { BookmarkPageLink } from "#shared/models/app/BookmarkPageLink";

import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useBookmarkStore } from "#src/store/bookmark";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe(useBookmarkStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const path = "/";
  const title = "title";

  // A second tab bookmarked the page first, so this tab's optimistic flip bookmarks it while the server's
  // Delete-then-insert finds the bookmark, removes it and answers false
  test("takes the server's post-toggle state over the optimistic flip", async () => {
    expect.hasAssertions();

    trpcMsw.bookmark.toggleBookmark.mutation(() => false);
    const bookmarkStore = useBookmarkStore();
    const { bookmarks } = storeToRefs(bookmarkStore);
    const { toggleBookmark } = bookmarkStore;
    toggleBookmark({ path, title });
    await flushPromises();

    expect(bookmarks.value).toStrictEqual([]);
  });

  test("rolls a failed toggle back to the state the toggle ahead of it stored", async () => {
    expect.hasAssertions();

    let isFailing = false;
    trpcMsw.bookmark.toggleBookmark.mutation(() => {
      if (isFailing) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });

      isFailing = true;
      return true;
    });
    const bookmarkStore = useBookmarkStore();
    const { bookmarks } = storeToRefs(bookmarkStore);
    const { toggleBookmark } = bookmarkStore;
    toggleBookmark({ path, title });
    toggleBookmark({ path, title });
    await flushPromises();

    expect(bookmarks.value).toStrictEqual([{ isAvailable: true, path, title }]);
  });

  // A read issued before the bookmark was added and removed answers the page as it stood then, so the answer lands on
  // A list that already took the removal and must not bring the bookmark back
  test("does not restore a bookmark a read answers after it was added and removed", async () => {
    expect.hasAssertions();

    const { promise: readResponse, resolve: completeRead } = Promise.withResolvers<BookmarkPageLink[]>();
    trpcMsw.bookmark.readBookmarks.query(() => readResponse);
    let isBookmarkedAfterToggle = true;
    trpcMsw.bookmark.toggleBookmark.mutation(() => {
      const isBookmarked = isBookmarkedAfterToggle;
      isBookmarkedAfterToggle = !isBookmarkedAfterToggle;
      return isBookmarked;
    });
    const bookmarkStore = useBookmarkStore();
    const { bookmarks } = storeToRefs(bookmarkStore);
    const { readBookmarks, toggleBookmark } = bookmarkStore;
    const inFlightRead = readBookmarks();
    toggleBookmark({ path, title });
    await flushPromises();
    toggleBookmark({ path, title });
    await flushPromises();
    completeRead([{ isAvailable: true, path, title }]);
    await inFlightRead;

    expect(bookmarks.value).toStrictEqual([]);
  });

  // A read answers a removed bookmark as a tombstone, and the list leaves it out
  test("does not list a bookmark a read answers as removed", async () => {
    expect.hasAssertions();

    const removedBookmark = { deletedAt: new Date(0), isAvailable: true, path, title };
    trpcMsw.bookmark.readBookmarks.query(() => [removedBookmark]);
    const bookmarkStore = useBookmarkStore();
    const { bookmarks } = storeToRefs(bookmarkStore);
    const { readBookmarks } = bookmarkStore;
    await readBookmarks();

    expect(bookmarks.value).toStrictEqual([]);
  });
});
