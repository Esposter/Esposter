// @vitest-environment nuxt
import type { PostCounts } from "@/services/post/postCountHooks";

import { MAX_POST_COUNTS_PER_READ } from "#shared/models/db/post/ReadPostCountsInput";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { usePostCountStore } from "@/store/post/count";
import { describe, expect, test, vi } from "vitest";

describe(usePostCountStore, () => {
  const { trpcMsw } = setupMswTrpc();

  // A read takes at most MAX_POST_COUNTS_PER_READ ids, so a set larger than that is read chunk by chunk rather than
  // Refused whole, and the server never sees a list it would reject
  test("reads a set larger than one read takes in chunks", async () => {
    expect.hasAssertions();

    const readPostCounts = vi.fn<(postIds: string[]) => PostCounts>(() => []);
    trpcMsw.post.readPostCounts.query(({ input }) => readPostCounts(input));
    const postIds = Array.from({ length: MAX_POST_COUNTS_PER_READ + 1 }, () => crypto.randomUUID());
    const postCountStore = usePostCountStore();
    const { refreshPostCounts } = postCountStore;

    await refreshPostCounts(postIds);

    expect(readPostCounts.mock.calls.map(([postIdsChunk]) => postIdsChunk.length)).toStrictEqual([
      MAX_POST_COUNTS_PER_READ,
      1,
    ]);
  });
});
