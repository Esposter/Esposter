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
    const userId = getMockSession().user.id;

    expect(deletedLike.value).toBe(value);
    expect(deletedLike.userId).toBe(userId);
    expect(deletedLike.postId).toBe(newPost.id);
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
