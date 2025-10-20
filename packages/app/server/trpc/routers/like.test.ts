import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { likeRouter } from "@@/server/trpc/routers/like";
import { postRouter } from "@@/server/trpc/routers/post";
import { DatabaseEntityType } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { beforeAll, describe, expect, test } from "vitest";

describe("like", () => {
  let likeCaller: DecorateRouterRecord<TRPCRouter["like"]>;
  let postCaller: DecorateRouterRecord<TRPCRouter["post"]>;
  let mockContext: Context;
  const title = "title";
  const value = 1;
  const updatedValue = -1;

  beforeAll(async () => {
    const createPostCaller = createCallerFactory(postRouter);
    const createLikeCaller = createCallerFactory(likeRouter);
    mockContext = await createMockContext();
    postCaller = createPostCaller(mockContext);
    likeCaller = createLikeCaller(mockContext);
  });

  test("creates", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const newLike = await likeCaller.createLike({ postId: newPost.id, value });
    const readPost = await postCaller.readPost(newPost.id);

    expect(newLike.value).toBe(value);
    expect(readPost.noLikes).toBe(value);
  });

  test("fails create with non-existent post id", async () => {
    expect.hasAssertions();

    const postId = crypto.randomUUID();

    await expect(likeCaller.createLike({ postId, value: 1 })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Post, postId).message}]`,
    );
  });

  test("updates", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    await likeCaller.createLike({ postId: newPost.id, value });
    const updatedLike = await likeCaller.updateLike({ postId: newPost.id, value: updatedValue });
    const readPost = await postCaller.readPost(newPost.id);

    expect(updatedLike.value).toBe(updatedValue);
    expect(readPost.noLikes).toBe(updatedValue);
  });

  test("fails update with non-existent post id", async () => {
    expect.hasAssertions();

    const postId = crypto.randomUUID();

    await expect(likeCaller.updateLike({ postId, value: updatedValue })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Post, postId).message}]`,
    );
  });

  test("fails update with non-existent id", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });

    await expect(likeCaller.updateLike({ postId: newPost.id, value })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Like, newPost.id).message}]`,
    );
  });

  test("fails update with wrong user", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    await likeCaller.createLike({ postId: newPost.id, value });
    await mockSessionOnce(mockContext.db);

    await expect(likeCaller.updateLike({ postId: newPost.id, value })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Like, newPost.id).message}]`,
    );
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    await likeCaller.createLike({ postId: newPost.id, value });
    const deletedLike = await likeCaller.deleteLike(newPost.id);

    expect(deletedLike).toStrictEqual({ postId: newPost.id, userId: getMockSession().user.id, value });
  });

  test("fails delete with non-existent post id", async () => {
    expect.hasAssertions();

    const id = crypto.randomUUID();

    await expect(likeCaller.deleteLike(id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Post, id).message}]`,
    );
  });

  test("fails delete with non-existent id", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });

    await expect(likeCaller.deleteLike(newPost.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.Like, newPost.id).message}]`,
    );
  });

  test("fails delete with wrong user", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    await likeCaller.createLike({ postId: newPost.id, value });
    await mockSessionOnce(mockContext.db);

    await expect(likeCaller.deleteLike(newPost.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.Like, newPost.id).message}]`,
    );
  });
});
