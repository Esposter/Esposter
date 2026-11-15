// @vitest-environment nuxt
import type { readPostsInputSchema } from "#shared/models/db/post/ReadPostsInput";
import type { z } from "zod";

import { PostSortType } from "#shared/models/post/PostSortType";
import { usePagedPostRead } from "#src/composables/post/usePagedPostRead";
import { createPost } from "#src/services/post/createPost.test";
import { AsyncDataKey } from "#src/services/shared/AsyncDataKey";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { usePostStore } from "#src/store/post/index";
import { encodePageCursor, START_PAGE_CURSOR } from "@esposter/db-schema";
import { noop } from "@esposter/shared";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

type ReadPostsQuery = NonNullable<z.input<typeof readPostsInputSchema>>;

const createPagedRead = () => {
  const postStore = usePostStore();
  const { readItems, readMoreItems } = postStore;
  return usePagedPostRead({ readItems, readMoreItems });
};

describe(usePagedPostRead, () => {
  const { trpcMsw } = setupMswTrpc();
  const userId = v7();

  test("reads the first page with the query it is given", async () => {
    expect.hasAssertions();

    const sentQueries: ReadPostsQuery[] = [];
    trpcMsw.post.readPosts.query(({ input }) => {
      if (input) sentQueries.push(input);
      return { items: [createPost({ userId })], nextCursor: "" };
    });
    const { readFirstPage } = createPagedRead();
    await readFirstPage({ userId }, AsyncDataKey.ReadPosts(PostSortType.Hot, userId));

    expect(sentQueries.map((query) => query.userId)).toStrictEqual([userId]);
  });

  // A later page is asked for on the cursor the page before it left, not on a cursor of its own
  test("reads each later page on the cursor the page before it left", async () => {
    expect.hasAssertions();

    const pageCursor = { isBackward: false, values: [1, v7()] };
    const sentCursors: unknown[] = [];
    trpcMsw.post.readPosts.query(({ input }) => {
      sentCursors.push(input?.cursor);
      return sentCursors.length === 1
        ? { items: [createPost()], nextCursor: encodePageCursor(pageCursor) }
        : { items: [createPost()], nextCursor: "" };
    });
    const { readFirstPage, readMorePages } = createPagedRead();
    await readFirstPage({ userId }, AsyncDataKey.ReadPosts(PostSortType.Hot, userId));
    await readMorePages({ userId }, noop);

    expect(sentCursors).toStrictEqual([START_PAGE_CURSOR, pageCursor]);
  });
});
