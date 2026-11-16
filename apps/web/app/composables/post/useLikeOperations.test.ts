// @vitest-environment nuxt
import type { LikeInPost } from "@esposter/db-schema";

import { useLikeOperations } from "#src/composables/post/useLikeOperations";
import { useSession } from "#src/services/auth/authClient.test";
import { createPost } from "#src/services/post/createPost.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { usePostStore } from "#src/store/post/index";
import { takeOne, waitForSynchronizedFunctions } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test } from "vitest";

describe(useLikeOperations, () => {
  const { trpcMsw } = setupMswTrpc();
  const postId = v7();
  const userId = v7();
  const createLike = (value: -1 | 1): LikeInPost => ({
    createdAt: new Date(0),
    deletedAt: null,
    postId,
    updatedAt: new Date(0),
    userId,
    value,
  });

  // A new vote is drawn for the signed-in viewer, so every test here signs one in
  beforeEach(() => {
    useSession.mockReturnValue({ value: { data: { user: { id: userId } } } });
  });

  // The count the server holds once the votes settle, as a read of it returns it. Each read counts itself on the ref
  // Returned, so a test can wait for the reads its votes send
  const serveLikeCount = (likeCount: number) => {
    const readCount = ref(0);
    trpcMsw.post.readPostCounts.query(() => {
      readCount.value += 1;
      return [{ commentCount: 0, id: postId, likeCount }];
    });
    return readCount;
  };

  // Two quick votes on one post queue under the same key, so the second's rollback has to undo its own vote. The
  // Vote it read when the user clicked is the one the first call already replaced, and the restored vote would be
  // Computed against it
  test("rolls a failed vote back to the vote ahead of it", async () => {
    expect.hasAssertions();

    const isFailingVoteReceived = Promise.withResolvers<void>();
    trpcMsw.like.updateLike.mutation(({ input }) => {
      if (input.value === 1) {
        isFailingVoteReceived.resolve();
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
      }

      return createLike(input.value);
    });
    serveLikeCount(-1);
    const post = createPost({ id: postId, likeCount: 1, viewerLike: createLike(1) });
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    items.value = [post];
    const { updateLike } = useLikeOperations(items);
    updateLike({ postId, value: -1 });
    updateLike({ postId, value: 1 });

    // The refused vote stays drawn until its rollback runs, and the drain is the sign it and its read-back have landed
    await isFailingVoteReceived.promise;
    await waitForSynchronizedFunctions();

    expect(post.viewerLike).toStrictEqual(createLike(-1));
    expect(post.likeCount).toBe(-1);
  });

  // A second withdrawal queues behind the first and finds the vote already gone, so it withdraws nothing, and the
  // Count shown is the one the server holds after the first, not a value the two withdrawals moved by twice
  test("shows the count the server holds after two deletes queue", async () => {
    expect.hasAssertions();

    trpcMsw.like.deleteLike.mutation(() => createLike(1));
    const readCount = serveLikeCount(0);
    const post = createPost({ id: postId, likeCount: 1, viewerLike: createLike(1) });
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    items.value = [post];
    const { deleteLike } = useLikeOperations(items);
    deleteLike(postId);
    deleteLike(postId);

    // Each kept withdrawal reads the count back, so the wait is for both reads
    await until(readCount).toBe(2);
    expect(post.viewerLike).toBeUndefined();
    expect(post.likeCount).toBe(0);
  });

  // The vote's own effect on the count is known to the client, so the count moves before the server answers
  test("a rapid second click on a like creates only one like", async () => {
    expect.hasAssertions();

    const receivedValues: number[] = [];
    trpcMsw.like.createLike.mutation(({ input }) => {
      receivedValues.push(input.value);
      return createLike(input.value);
    });
    serveLikeCount(1);
    const post = createPost({ id: postId, likeCount: 0 });
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    items.value = [post];
    const { createLike: sendLike } = useLikeOperations(items);
    sendLike({ postId, value: 1 });
    sendLike({ postId, value: 1 });
    await waitForSynchronizedFunctions();

    expect(receivedValues).toStrictEqual([1]);
  });

  test("a count moves at once while its write is in flight", async () => {
    expect.hasAssertions();

    const heldWrite = Promise.withResolvers<void>();
    const isWriteReceived = Promise.withResolvers<void>();
    trpcMsw.like.createLike.mutation(async ({ input }) => {
      isWriteReceived.resolve();
      await heldWrite.promise;

      return createLike(input.value);
    });
    const readCount = serveLikeCount(2);
    const post = createPost({ id: postId, likeCount: 1 });
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    items.value = [post];
    const { createLike: sendLike } = useLikeOperations(items);
    sendLike({ postId, value: 1 });

    await isWriteReceived.promise;

    expect(post.likeCount).toBe(2);

    heldWrite.resolve();
    await until(readCount).toBe(1);
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
    serveLikeCount(0);
    const post = createPost({ id: postId, likeCount: 1, viewerLike: createLike(1) });
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    items.value = [post];
    const { updateLike } = useLikeOperations(items);
    updateLike({ postId, value: -1 });

    await isWriteReceived.promise;

    expect(post.likeCount).toBe(-1);

    heldWrite.resolve();
    await until(() => takeOne(items.value).likeCount).toBe(0);
    expect(takeOne(items.value).likeCount).toBe(0);
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
    const readCount = serveLikeCount(0);
    const post = createPost({ id: postId, likeCount: 1, viewerLike: createLike(1) });
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    items.value = [post];
    const { deleteLike } = useLikeOperations(items);
    deleteLike(postId);

    await isWriteReceived.promise;

    expect(post.likeCount).toBe(0);

    heldWrite.resolve();
    await until(readCount).toBe(1);
  });

  test("a failed vote restores the count", async () => {
    expect.hasAssertions();

    const heldWrite = Promise.withResolvers<void>();
    const isWriteReceived = Promise.withResolvers<void>();
    trpcMsw.like.createLike.mutation(async () => {
      isWriteReceived.resolve();
      await heldWrite.promise;

      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    // The read the refusal sends is held, so the count is seen restored before it answers. It answers with another
    // Viewer's vote, which only a read back can show
    const heldRead = Promise.withResolvers<void>();
    const isReadReceived = Promise.withResolvers<void>();
    trpcMsw.post.readPostCounts.query(async () => {
      isReadReceived.resolve();
      await heldRead.promise;
      return [{ commentCount: 0, id: postId, likeCount: 2 }];
    });
    const post = createPost({ id: postId, likeCount: 1 });
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    items.value = [post];
    const { createLike: sendLike } = useLikeOperations(items);
    sendLike({ postId, value: 1 });
    await isWriteReceived.promise;
    const optimisticLikeCount = takeOne(items.value).likeCount;
    heldWrite.resolve();
    await isReadReceived.promise;
    const restoredLikeCount = takeOne(items.value).likeCount;
    heldRead.resolve();
    await waitForSynchronizedFunctions();

    expect(optimisticLikeCount).toBe(2);
    expect(restoredLikeCount).toBe(1);
    expect(takeOne(items.value).likeCount).toBe(2);
  });

  test("the count shows the read-back value once the write settles", async () => {
    expect.hasAssertions();

    trpcMsw.like.createLike.mutation(({ input }) => createLike(input.value));
    serveLikeCount(3);
    const post = createPost({ id: postId, likeCount: 1 });
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    items.value = [post];
    const { createLike: sendLike } = useLikeOperations(items);
    sendLike({ postId, value: 1 });

    // The vote draws the count to 2 at once, so the wait is for the read-back to replace it with the server's 3
    await until(() => takeOne(items.value).likeCount).toBe(3);
    expect(takeOne(items.value).likeCount).toBe(3);
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
    const readCount = serveLikeCount(1);
    const post = createPost({ id: postId, likeCount: 1, viewerLike: createLike(1) });
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    items.value = [post];
    const { updateLike } = useLikeOperations(items);
    updateLike({ postId, value: -1 });

    await isWriteReceived.promise;
    expect(post.viewerLike).toStrictEqual(createLike(-1));
    heldWrite.resolve();
    await until(readCount).toBe(1);
  });
});
