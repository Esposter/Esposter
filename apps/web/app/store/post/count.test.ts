// @vitest-environment nuxt
import type { PostCounts } from "#src/services/post/applyPostCounts";

import { MAX_POST_COUNTS_PER_READ } from "#shared/models/db/post/ReadPostCountsInput";
import { createPost } from "#src/services/post/createPost.test";
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

    const readPostCounts = vi.fn<(postIds: string[]) => PostCounts>(() => []);
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

  // A store's copies take each read's counts for as long as the store's scope lives, so a read after that scope is
  // Gone leaves the copy as it was
  test("a store's copies stop taking counts once its scope is disposed", async () => {
    expect.hasAssertions();

    let likeCount = 1;
    trpcMsw.post.readPostCounts.query(({ input }) =>
      input.map((postId) => ({ commentCount: 0, id: postId, likeCount })),
    );
    const postId = v7();
    const copy = createPost({ id: postId });
    const postCountStore = usePostCountStore();
    const { refreshPostCounts, registerPostCopies } = postCountStore;
    const scope = effectScope();
    scope.run(() => {
      registerPostCopies(() => [copy]);
    });
    await refreshPostCounts([postId]);

    expect(copy.likeCount).toBe(1);

    scope.stop();
    likeCount = 2;
    await refreshPostCounts([postId]);

    expect(copy.likeCount).toBe(1);
  });
});
