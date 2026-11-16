// @vitest-environment nuxt
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
});
