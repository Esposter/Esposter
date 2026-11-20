// @vitest-environment nuxt
import type { PostCountFields } from "#src/models/post/PostCountFields";

import { MAX_POST_COUNTS_PER_READ } from "#shared/models/db/post/ReadPostCountsInput";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { usePostCountStore } from "#src/store/post/count";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

describe(usePostCountStore, () => {
  const { trpcMsw } = setupMswTrpc();

  // A read takes at most MAX_POST_COUNTS_PER_READ ids, so a set larger than that is read chunk by chunk rather than
  // Refused whole, and the server never sees a list it would reject
  test("reads a set larger than one read takes in chunks", async () => {
    expect.hasAssertions();

    const readPostCounts = vi.fn<(postIds: string[]) => PostCountFields[]>(() => []);
    trpcMsw.post.readPostCounts.query(({ input }) => readPostCounts(input));
    const postIds = Array.from({ length: MAX_POST_COUNTS_PER_READ + 1 }, () => v7());
    const postCountStore = usePostCountStore();
    const { refreshPostCounts } = postCountStore;

    await refreshPostCounts(postIds);

    expect(readPostCounts.mock.calls.map(([postIdsChunk]) => postIdsChunk.length)).toStrictEqual([
      MAX_POST_COUNTS_PER_READ,
      1,
    ]);
  });

  // A count moves in the write that raises its post's version, so a read that was answered before a newer count landed
  // Holds an older version, and it does not put that count back
  test("a read answered at an older version does not replace the count a newer one holds", async () => {
    expect.hasAssertions();

    const postId = v7();
    trpcMsw.post.readPostCounts.query(() => [{ commentCount: 0, id: postId, likeCount: 1, version: 1 }]);
    const postCountStore = usePostCountStore();
    const { postCounts, refreshPostCounts, setPostCounts } = postCountStore;
    setPostCounts([{ commentCount: 0, id: postId, likeCount: 2, version: 2 }]);

    await refreshPostCounts([postId]);

    expect(postCounts.get(postId)?.likeCount).toBe(2);
  });
});
