// @vitest-environment nuxt
import type { LikeInPost } from "@esposter/db-schema";

import { useLikeOperations } from "@/composables/post/useLikeOperations";
import { createPost } from "@/services/post/createPost.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { usePostStore } from "@/store/post";
import { TRPCError } from "@trpc/server";
import { describe, expect, test } from "vitest";

describe(useLikeOperations, () => {
  const { trpcMsw } = setupMswTrpc();
  const postId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const createLike = (value: -1 | 1): LikeInPost => ({
    createdAt: new Date(0),
    deletedAt: null,
    postId,
    updatedAt: new Date(0),
    userId,
    value,
  });

  // The count the server holds once the votes settle, as a read of it returns it
  const serveLikeCount = (likeCount: number) => {
    trpcMsw.post.readPostCounts.query(() => [{ commentCount: 0, id: postId, likeCount }]);
  };

  // Two quick votes on one post queue under the same key, so the second's rollback has to undo its own vote. The
  // Vote it read when the user clicked is the one the first call already replaced, and the restored vote would be
  // Computed against it
  test("rolls a failed vote back to the vote ahead of it", async () => {
    expect.hasAssertions();

    trpcMsw.like.updateLike.mutation(({ input }) => {
      if (input.value === 1) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });

      return createLike(input.value);
    });
    serveLikeCount(-1);
    const post = createPost({ id: postId, likeCount: 1, viewerLike: createLike(1) });
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    items.value = [post];
    const { updateLike } = useLikeOperations(items);
    await Promise.all([updateLike({ postId, value: -1 }), updateLike({ postId, value: 1 })]);

    expect(post.viewerLike).toStrictEqual(createLike(-1));
    expect(post.likeCount).toBe(-1);
  });

  // A second withdrawal queues behind the first and finds the vote already gone, so it withdraws nothing, and the
  // Count shown is the one the server holds after the first, not a value the two withdrawals moved by twice
  test("shows the count the server holds after two deletes queue", async () => {
    expect.hasAssertions();

    trpcMsw.like.deleteLike.mutation(() => createLike(1));
    serveLikeCount(0);
    const post = createPost({ id: postId, likeCount: 1, viewerLike: createLike(1) });
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    items.value = [post];
    const { deleteLike } = useLikeOperations(items);
    await Promise.all([deleteLike(postId), deleteLike(postId)]);

    expect(post.viewerLike).toBeUndefined();
    expect(post.likeCount).toBe(0);
  });
});
