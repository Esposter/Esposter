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

  // The vote's own effect on the count is known to the client, so the count moves before the server answers
  test("a count moves at once while its write is in flight", async () => {
    expect.hasAssertions();

    const heldWrite = Promise.withResolvers<void>();
    const isWriteReceived = Promise.withResolvers<void>();
    trpcMsw.like.createLike.mutation(async ({ input }) => {
      isWriteReceived.resolve();
      await heldWrite.promise;

      return createLike(input.value);
    });
    serveLikeCount(2);
    const post = createPost({ id: postId, likeCount: 1 });
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    items.value = [post];
    const { createLike: sendLike } = useLikeOperations(items);
    const pendingLike = sendLike({ postId, value: 1 });

    await isWriteReceived.promise;

    expect(post.likeCount).toBe(2);

    heldWrite.resolve();
    await pendingLike;
  });

  test("a flipped vote moves the count by both its sides and the read-back settles it", async () => {
    expect.hasAssertions();

    const heldWrite = Promise.withResolvers<void>();
    const isWriteReceived = Promise.withResolvers<void>();
    trpcMsw.like.updateLike.mutation(async ({ input }) => {
      isWriteReceived.resolve();
      await heldWrite.promise;

      return createLike(input.value);
    });
    serveLikeCount(-1);
    const post = createPost({ id: postId, likeCount: 1, viewerLike: createLike(1) });
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    items.value = [post];
    const { updateLike } = useLikeOperations(items);
    const pendingVote = updateLike({ postId, value: -1 });

    await isWriteReceived.promise;

    expect(post.likeCount).toBe(-1);

    heldWrite.resolve();
    await pendingVote;

    expect(post.likeCount).toBe(-1);
  });

  test("a withdrawn vote takes its value off the count at once", async () => {
    expect.hasAssertions();

    const heldWrite = Promise.withResolvers<void>();
    const isWriteReceived = Promise.withResolvers<void>();
    trpcMsw.like.deleteLike.mutation(async () => {
      isWriteReceived.resolve();
      await heldWrite.promise;

      return createLike(1);
    });
    serveLikeCount(0);
    const post = createPost({ id: postId, likeCount: 1, viewerLike: createLike(1) });
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    items.value = [post];
    const { deleteLike } = useLikeOperations(items);
    const pendingDelete = deleteLike(postId);

    await isWriteReceived.promise;

    expect(post.likeCount).toBe(0);

    heldWrite.resolve();
    await pendingDelete;
  });

  test("a count the server refuses to move goes back to what it was", async () => {
    expect.hasAssertions();

    const heldRead = Promise.withResolvers<void>();
    const isReadReceived = Promise.withResolvers<void>();
    trpcMsw.like.createLike.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    trpcMsw.post.readPostCounts.query(async () => {
      isReadReceived.resolve();
      await heldRead.promise;

      return [{ commentCount: 0, id: postId, likeCount: 1 }];
    });
    const post = createPost({ id: postId, likeCount: 1 });
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    items.value = [post];
    const { createLike: sendLike } = useLikeOperations(items);
    const pendingSend = sendLike({ postId, value: 1 });

    // The read-back is only sent after the failed write has run its rollback, so the count seen while it is held is
    // The one the copy is left with, before the server's answer could mask a missing rollback
    await isReadReceived.promise;
    const likeCountWhileReadIsHeld = post.likeCount;
    heldRead.resolve();
    await pendingSend;

    expect(likeCountWhileReadIsHeld).toBe(1);
  });

  test("the count shows the read-back value once the write settles", async () => {
    expect.hasAssertions();

    trpcMsw.like.createLike.mutation(({ input }) => createLike(input.value));
    serveLikeCount(2);
    const post = createPost({ id: postId, likeCount: 1 });
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    items.value = [post];
    const { createLike: sendLike } = useLikeOperations(items);
    await sendLike({ postId, value: 1 });

    expect(post.likeCount).toBe(2);
  });

  // The viewer's own vote is held exactly by the client, so it may change before the server answers
  test("the viewer's own mark changes at once", async () => {
    expect.hasAssertions();

    const heldWrite = Promise.withResolvers<void>();
    const isWriteReceived = Promise.withResolvers<void>();
    trpcMsw.like.updateLike.mutation(async ({ input }) => {
      isWriteReceived.resolve();
      await heldWrite.promise;

      return createLike(input.value);
    });
    serveLikeCount(1);
    const post = createPost({ id: postId, likeCount: 1, viewerLike: createLike(1) });
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    items.value = [post];
    const { updateLike } = useLikeOperations(items);
    const pendingVote = updateLike({ postId, value: -1 });

    await isWriteReceived.promise;
    expect(post.viewerLike).toStrictEqual(createLike(-1));
    heldWrite.resolve();
    await pendingVote;
  });
});
