// @vitest-environment nuxt
import type { Like } from "@esposter/db-schema";

import { useLikeOperations } from "@/composables/post/useLikeOperations";
import { createPost } from "@/services/post/createPost.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useLikeOperations, () => {
  const server = setupMswTrpc();
  const postId = crypto.randomUUID();
  const createLike = (value: -1 | 1): Like => ({
    createdAt: new Date(0),
    deletedAt: null,
    postId,
    updatedAt: new Date(0),
    userId: "userId",
    value,
  });

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // Two quick votes on one post queue under the same key, so the second's rollback has to undo its own vote. The
  // Vote it read when the user clicked is the one the first call already replaced, and both the count delta and
  // The restored vote would be computed against it
  test("rolls a failed vote back to the vote ahead of it", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.like.updateLike.mutation(({ input }) => {
        if (input.value === 1) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });

        return createLike(input.value);
      }),
    );
    const post = createPost({ id: postId, likeCount: 1, viewerLike: createLike(1) });
    const { updateLike } = useLikeOperations([post]);
    await Promise.all([updateLike({ postId, value: -1 }), updateLike({ postId, value: 1 })]);

    expect(post.viewerLike).toStrictEqual(createLike(-1));
    expect(post.likeCount).toBe(-1);
  });

  // A second withdrawal queues behind the first and finds the vote already gone, so it has nothing to take off
  // The count — the vote it read when the user clicked would be subtracted a second time
  test("withdraws one vote from the count when two deletes queue", async () => {
    expect.hasAssertions();

    server.use(trpcMsw.like.deleteLike.mutation(() => createLike(1)));
    const post = createPost({ id: postId, likeCount: 1, viewerLike: createLike(1) });
    const { deleteLike } = useLikeOperations([post]);
    await Promise.all([deleteLike(postId), deleteLike(postId)]);

    expect(post.viewerLike).toBeUndefined();
    expect(post.likeCount).toBe(0);
  });
});
