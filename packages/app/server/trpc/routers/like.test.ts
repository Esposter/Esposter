import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockUserOnce } from "@@/server/trpc/context.test";
import { likeRouter } from "@@/server/trpc/routers/like";
import { postRouter } from "@@/server/trpc/routers/post";
import { NIL } from "@esposter/shared";
import { beforeAll, describe, expect, test } from "vitest";

describe("like", () => {
  let likeCaller: DecorateRouterRecord<TRPCRouter["like"]>;
  let postCaller: DecorateRouterRecord<TRPCRouter["post"]>;
  let mockContext: Context;
  const title = "title";
  const value = 1;
  const updatedValue = -1;

  beforeAll(async () => {
    const createLikeCaller = createCallerFactory(likeRouter);
    const createPostCaller = createCallerFactory(postRouter);
    mockContext = await createMockContext();
    likeCaller = createLikeCaller(mockContext);
    postCaller = createPostCaller(mockContext);
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

    await expect(likeCaller.createLike({ postId: NIL, value: 1 })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Post is not found for id: 00000000-0000-0000-0000-000000000000]`,
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

    await expect(
      likeCaller.updateLike({ postId: NIL, value: updatedValue }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Post is not found for id: 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test("fails update with non-existent id", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });

    await expect(likeCaller.updateLike({ postId: newPost.id, value })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Like is not found for id: {"postId":"${newPost.id}"}]`,
    );
  });

  test("fails update with wrong user", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    await likeCaller.createLike({ postId: newPost.id, value });
    await mockUserOnce(mockContext.db);

    await expect(likeCaller.updateLike({ postId: newPost.id, value })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Like is not found for id: {"postId":"${newPost.id}"}]`,
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

    await expect(likeCaller.deleteLike(NIL)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Post is not found for id: 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test("fails delete with non-existent id", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });

    await expect(likeCaller.deleteLike(newPost.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Delete, name: Like, {"postId":"${newPost.id}"}]`,
    );
  });

  test("fails delete with wrong user", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    await likeCaller.createLike({ postId: newPost.id, value });
    await mockUserOnce(mockContext.db);

    await expect(likeCaller.deleteLike(newPost.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Delete, name: Like, {"postId":"${newPost.id}"}]`,
    );
  });
});
