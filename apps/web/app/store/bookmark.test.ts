// @vitest-environment nuxt
import type { BookmarkInApp } from "@esposter/db-schema";
import type { ReadBookmark } from "#shared/models/db/bookmark/ReadBookmark";

import { setupSession } from "#src/services/auth/setupSession.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useBookmarkStore } from "#src/store/bookmark";
import { PageMarkType } from "#shared/models/app/PageMarkType";
import { ResourceType } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useBookmarkStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const userId = v7();
  const path = "/";
  const title = "title";
  const epoch = new Date(0);
  setupSession(userId);
  // A bookmark row as the server answers it, at the version its write left it
  const createBookmarkRow = (version: number, deletedAt: Date | null = null): BookmarkInApp => ({
    createdAt: epoch,
    deletedAt,
    path,
    resourceId: null,
    roomId: null,
    title,
    updatedAt: epoch,
    userId,
    version,
  });
  // A bookmark as a read answers it: its row, with the fields the read joins in from other tables
  const createReadBookmark = (version: number, deletedAt: Date | null = null): ReadBookmark => ({
    ...createBookmarkRow(version, deletedAt),
    isAvailable: true,
  });

  // A second tab bookmarked the page first, so this tab's optimistic flip bookmarks it while the server's removal
  // Answers the row as a tombstone
  test("takes the server's post-toggle state over the optimistic flip", async () => {
    expect.hasAssertions();

    trpcMsw.bookmark.toggleBookmark.mutation(() => createBookmarkRow(1, epoch));
    const bookmarkStore = useBookmarkStore();
    const { bookmarks } = storeToRefs(bookmarkStore);
    const { toggleBookmark } = bookmarkStore;
    toggleBookmark({ path, title });
    await flushPromises();

    expect(bookmarks.value).toStrictEqual([]);
  });

  test("keeps the state the toggle ahead of a refused one stored", async () => {
    expect.hasAssertions();

    let isFailing = false;
    trpcMsw.bookmark.toggleBookmark.mutation(() => {
      if (isFailing) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });

      isFailing = true;
      return createBookmarkRow(0);
    });
    const bookmarkStore = useBookmarkStore();
    const { bookmarks } = storeToRefs(bookmarkStore);
    const { toggleBookmark } = bookmarkStore;
    toggleBookmark({ path, title });
    toggleBookmark({ path, title });
    await flushPromises();

    expect(bookmarks.value).toStrictEqual([{ isAvailable: true, path, title }]);
  });

  test("draws a bookmark made here with the mark it names", async () => {
    expect.hasAssertions();

    const mark = { id: v7(), resourceType: ResourceType.Note, type: PageMarkType.Resource } as const;
    trpcMsw.bookmark.toggleBookmark.mutation(() => ({ ...createBookmarkRow(0), resourceId: mark.id }));
    const bookmarkStore = useBookmarkStore();
    const { bookmarks } = storeToRefs(bookmarkStore);
    const { toggleBookmark } = bookmarkStore;
    toggleBookmark({ mark, path, title });
    await flushPromises();

    expect(bookmarks.value).toStrictEqual([{ isAvailable: true, mark, path, title }]);
  });

  // A read issued before the bookmark was added and removed answers the page as it stood then, so the answer lands on
  // A list that already took the removal and must not bring the bookmark back
  test("does not restore a bookmark a read answers after it was added and removed", async () => {
    expect.hasAssertions();

    const { promise: readResponse, resolve: completeRead } = Promise.withResolvers<ReadBookmark[]>();
    trpcMsw.bookmark.readBookmarks.query(() => readResponse);
    let toggleCount = 0;
    trpcMsw.bookmark.toggleBookmark.mutation(() => {
      toggleCount += 1;
      return toggleCount === 1 ? createBookmarkRow(0) : createBookmarkRow(1, epoch);
    });
    const bookmarkStore = useBookmarkStore();
    const { bookmarks } = storeToRefs(bookmarkStore);
    const { readBookmarks, toggleBookmark } = bookmarkStore;
    const inFlightRead = readBookmarks();
    toggleBookmark({ path, title });
    await flushPromises();
    toggleBookmark({ path, title });
    await flushPromises();
    completeRead([createReadBookmark(0)]);
    await inFlightRead;

    expect(bookmarks.value).toStrictEqual([]);
  });

  // A read answers a removed bookmark as a tombstone, and the list leaves it out
  test("does not list a bookmark a read answers as removed", async () => {
    expect.hasAssertions();

    trpcMsw.bookmark.readBookmarks.query(() => [createReadBookmark(1, epoch)]);
    const bookmarkStore = useBookmarkStore();
    const { bookmarks } = storeToRefs(bookmarkStore);
    const { readBookmarks } = bookmarkStore;
    await readBookmarks();

    expect(bookmarks.value).toStrictEqual([]);
  });

  // The link fields a read joins in are drawn beside the row, so a page the reader cannot reach stays listed, unavailable
  test("draws a bookmark a read answers unavailable with the link fields the read joined in", async () => {
    expect.hasAssertions();

    trpcMsw.bookmark.readBookmarks.query(() => [{ ...createReadBookmark(0), isAvailable: false }]);
    const bookmarkStore = useBookmarkStore();
    const { bookmarks } = storeToRefs(bookmarkStore);
    const { readBookmarks } = bookmarkStore;
    await readBookmarks();

    expect(bookmarks.value).toStrictEqual([{ isAvailable: false, path, title }]);
  });
});
