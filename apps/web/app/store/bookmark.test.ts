// @vitest-environment nuxt
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useBookmarkStore } from "@/store/bookmark";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useBookmarkStore, () => {
  const server = setupMswTrpc();
  const path = "";
  const title = "title";

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // A second tab bookmarked the page first, so this tab's optimistic flip bookmarks it while the server's
  // Delete-then-insert finds the bookmark, removes it and answers false
  test("takes the server's post-toggle state over the optimistic flip", async () => {
    expect.hasAssertions();

    server.use(trpcMsw.bookmark.toggleBookmark.mutation(() => false));
    const bookmarkStore = useBookmarkStore();
    const { bookmarks } = storeToRefs(bookmarkStore);
    const { toggleBookmark } = bookmarkStore;
    await toggleBookmark(path, title);

    expect(bookmarks.value).toStrictEqual([]);
  });

  test("rolls a failed toggle back to the state the toggle ahead of it stored", async () => {
    expect.hasAssertions();

    let isFailing = false;
    server.use(
      trpcMsw.bookmark.toggleBookmark.mutation(() => {
        if (isFailing) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });

        isFailing = true;
        return true;
      }),
    );
    const bookmarkStore = useBookmarkStore();
    const { bookmarks } = storeToRefs(bookmarkStore);
    const { toggleBookmark } = bookmarkStore;
    await Promise.all([toggleBookmark(path, title), toggleBookmark(path, title)]);

    expect(bookmarks.value).toStrictEqual([{ path, title }]);
  });
});
