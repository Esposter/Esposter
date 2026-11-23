import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers/index";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createMockAuthSession, createMockContext, getMockSession } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { getUncoveredWrites } from "#server/trpc/optimisticWriteCrossCheck.test";
import { likeRouter } from "#server/trpc/routers/like";
import { postRouter } from "#server/trpc/routers/post";
import { likeTable, postTable } from "#src/services/post/overlay/constants";
import { getLikePatchEntry } from "#src/services/post/overlay/getLikePatchEntry";
import { getSetLikeEntry } from "#src/services/post/overlay/getSetLikeEntry";
import { DatabaseEntityType, NO_ROW_VERSION } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { beforeAll, describe, expect, test } from "vitest";

describe("likeRouter", () => {
  let mockContext: Context;
  let likeCaller: DecorateRouterRecord<TRPCRouter["like"]>;
  let postCaller: DecorateRouterRecord<TRPCRouter["post"]>;
  const title = "title";
  const value = 1;
  const updatedValue = -1;

  beforeAll(async () => {
    mockContext = await createMockContext();
    postCaller = createCallerFactory(postRouter)(mockContext);
    likeCaller = createCallerFactory(likeRouter)(mockContext);
  });

  test("creates", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const newLike = await likeCaller.createLike({ postId: newPost.id, value });
    const post = await postCaller.readPost(newPost.id);

    expect(newLike.value).toBe(value);
    expect(post.likeCount).toBe(value);
  });

  // The vote's entry is the one the store issues. The post it moves is named twice, for its count and then its ranking,
  // So the entry reads the post by its key, and a write to that post queues behind the vote
  test("the create entry covers every row the vote names", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const { named, uncovered } = await getUncoveredWrites({
      call: (context) => createCallerFactory(likeRouter)(context).createLike({ postId: newPost.id, value }),
      context: mockContext,
      entry: getSetLikeEntry({
        createdAt: new Date(0),
        deletedAt: null,
        postId: newPost.id,
        updatedAt: new Date(0),
        userId: getMockSession().user.id,
        value,
        version: NO_ROW_VERSION,
      }),
      path: "createLike",
      tables: [likeTable, postTable],
    });

    expect(named).toHaveLength(3);
    expect(uncovered).toStrictEqual([]);
  });

  test("fails create with existing like", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    await likeCaller.createLike({ postId: newPost.id, value });

    await expect(
      likeCaller.createLike({ postId: newPost.id, value: updatedValue }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Like, JSON.stringify({ postId: newPost.id, value: updatedValue })).message}]`,
    );
  });

  test("updates", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    await likeCaller.createLike({ postId: newPost.id, value });
    const updatedLike = await likeCaller.updateLike({ postId: newPost.id, value: updatedValue });
    const post = await postCaller.readPost(newPost.id);

    expect(updatedLike.value).toBe(updatedValue);
    expect(post.likeCount).toBe(updatedValue);
  });

  test("the update entry covers every row the update names", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    await likeCaller.createLike({ postId: newPost.id, value });
    const { named, uncovered } = await getUncoveredWrites({
      call: (context) =>
        createCallerFactory(likeRouter)(context).updateLike({ postId: newPost.id, value: updatedValue }),
      context: mockContext,
      entry: getLikePatchEntry(getMockSession().user.id, newPost.id, { value: updatedValue }),
      path: "updateLike",
      tables: [likeTable, postTable],
    });

    expect(named).toHaveLength(3);
    expect(uncovered).toStrictEqual([]);
  });

  test("fails update with a user who has no like on the post", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    await likeCaller.createLike({ postId: newPost.id, value });
    const otherAuthSession = await createMockAuthSession(mockContext.db);
    const otherLikeCaller = createCallerFactory(likeRouter)(await createMockContext(otherAuthSession));

    await expect(otherLikeCaller.updateLike({ postId: newPost.id, value })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Like, newPost.id).message}]`,
    );
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    await likeCaller.createLike({ postId: newPost.id, value });
    const deletedLike = await likeCaller.deleteLike(newPost.id);
    const userId = getMockSession().user.id;

    expect(deletedLike.value).toBe(value);
    expect(deletedLike.userId).toBe(userId);
    expect(deletedLike.postId).toBe(newPost.id);
  });

  test("the delete entry covers every row the removal names", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    await likeCaller.createLike({ postId: newPost.id, value });
    const { named, uncovered } = await getUncoveredWrites({
      call: (context) => createCallerFactory(likeRouter)(context).deleteLike(newPost.id),
      context: mockContext,
      entry: getLikePatchEntry(getMockSession().user.id, newPost.id, { deletedAt: new Date(0) }),
      path: "deleteLike",
      tables: [likeTable, postTable],
    });

    expect(named).toHaveLength(3);
    expect(uncovered).toStrictEqual([]);
  });

  // A removal keeps the vote as a tombstone, so the version it leaves is the one a later arrival of the row is ordered
  // Against
  test("deletes as a tombstone at a higher version", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    await likeCaller.createLike({ postId: newPost.id, value });
    const tombstone = await likeCaller.deleteLike(newPost.id);

    expect(tombstone.deletedAt).not.toBeNull();
    expect(tombstone.version).toBe(1);
  });

  // A vote made again revives the tombstone, so the version keeps climbing and the count is moved by the new vote alone
  test("revives a removed like at a higher version and counts it once", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    await likeCaller.createLike({ postId: newPost.id, value });
    const tombstone = await likeCaller.deleteLike(newPost.id);
    const revivedLike = await likeCaller.createLike({ postId: newPost.id, value });
    const post = await postCaller.readPost(newPost.id);

    expect(revivedLike.deletedAt).toBeNull();
    expect(revivedLike.version).toBe(tombstone.version + 1);
    expect(post.likeCount).toBe(value);
  });

  // The tombstone is no vote: it cannot be updated or removed again, and the post's count does not hold it
  test("refuses to update or remove a removed like, and leaves the count at zero", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    await likeCaller.createLike({ postId: newPost.id, value });
    await likeCaller.deleteLike(newPost.id);
    const post = await postCaller.readPost(newPost.id);

    await expect(
      likeCaller.updateLike({ postId: newPost.id, value: updatedValue }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Like, newPost.id).message}]`,
    );
    await expect(likeCaller.deleteLike(newPost.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.Like, newPost.id).message}]`,
    );
    expect(post.likeCount).toBe(0);
  });

  // A removed post takes no new vote, but the vote already on it is still removed, so the member is not left holding it
  test("removes a vote on a removed post", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    await likeCaller.createLike({ postId: newPost.id, value });
    await postCaller.deletePost(newPost.id);
    const removedLike = await likeCaller.deleteLike(newPost.id);

    expect(removedLike.deletedAt).not.toBeNull();
  });

  test("fails delete with a user who has no like on the post", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    await likeCaller.createLike({ postId: newPost.id, value });
    const otherAuthSession = await createMockAuthSession(mockContext.db);
    const otherLikeCaller = createCallerFactory(likeRouter)(await createMockContext(otherAuthSession));

    await expect(otherLikeCaller.deleteLike(newPost.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.Like, newPost.id).message}]`,
    );
  });
});
