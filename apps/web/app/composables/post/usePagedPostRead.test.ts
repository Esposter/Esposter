// @vitest-environment nuxt
import type { ReadPostsInput } from "#shared/models/db/post/ReadPostsInput";

import { usePagedPostRead } from "@/composables/post/usePagedPostRead";
import { PostSortType } from "@/models/post/PostSortType";
import { createPost } from "@/services/post/createPost.test";
import { AsyncDataKey } from "@/services/shared/AsyncDataKey";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { usePostStore } from "@/store/post";
import { noop } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(usePagedPostRead, () => {
  const { trpcMsw } = setupMswTrpc();
  const userId = crypto.randomUUID();
  const createPagedRead = () => {
    const { readItems, readMoreItems } = usePostStore();
    return usePagedPostRead({ readItems, readMoreItems });
  };

  test("reads the first page with the query it is given", async () => {
    expect.hasAssertions();

    const sentQueries: ReadPostsInput[] = [];
    trpcMsw.post.readPosts.query(({ input }) => {
      sentQueries.push(input);
      return { hasMore: false, items: [createPost({ userId })], nextCursor: "" };
    });
    const { readFirstPage } = createPagedRead();
    await readFirstPage({ userId }, AsyncDataKey.ReadPosts(PostSortType.Hot, userId));

    expect(sentQueries.map((query) => query.userId)).toStrictEqual([userId]);
  });

  // A later page is asked for on the cursor the page before it left, not on a cursor of its own
  test("reads each later page on the cursor the page before it left", async () => {
    expect.hasAssertions();

    const sentQueries: ReadPostsInput[] = [];
    trpcMsw.post.readPosts.query(({ input }) => {
      sentQueries.push(input);
      return input.cursor
        ? { hasMore: false, items: [createPost()], nextCursor: "" }
        : { hasMore: true, items: [createPost()], nextCursor: "cursor" };
    });
    const { readFirstPage, readMorePages } = createPagedRead();
    await readFirstPage({ userId }, AsyncDataKey.ReadPosts(PostSortType.Hot, userId));
    await readMorePages({ userId }, noop);

    expect(sentQueries.map((query) => query.cursor)).toStrictEqual(["", "cursor"]);
  });
});
