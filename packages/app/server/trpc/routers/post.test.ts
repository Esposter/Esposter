import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockUserOnce } from "@@/server/trpc/context.test";
import { postRouter } from "@@/server/trpc/routers/post";
import { NIL } from "@esposter/shared";
import { beforeAll, describe, expect, test } from "vitest";

describe("post", () => {
  let caller: DecorateRouterRecord<TRPCRouter["post"]>;
  let mockContext: Context;
  const title = "title";
  const updatedTitle = "updatedTitle";
  const description = "description";
  const updatedDescription = "updatedDescription";

  beforeAll(async () => {
    const createCaller = createCallerFactory(postRouter);
    mockContext = await createMockContext();
    caller = createCaller(mockContext);
  });

  test("creates", async () => {
    expect.hasAssertions();

    const newPost = await caller.createPost({ description, title });

    expect(newPost.title).toBe(title);
    expect(newPost.description).toBe(description);
  });

  test("reads", async () => {
    expect.hasAssertions();

    const newPost = await caller.createPost({ title });
    const readPost = await caller.readPost(newPost.id);

    expect(readPost).toStrictEqual(newPost);
  });

  test("fails read with non-existent id", async () => {
    expect.hasAssertions();

    await expect(caller.readPost(NIL)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Post is not found for id: 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test("updates", async () => {
    expect.hasAssertions();

    const newPost = await caller.createPost({ title });
    const updatedPost = await caller.updatePost({ id: newPost.id, title: updatedTitle });

    expect(updatedPost.title).toBe(updatedTitle);
  });

  test("fails update with non-existent id", async () => {
    expect.hasAssertions();

    await expect(caller.updatePost({ description, id: NIL })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: Post, 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test("fails update with wrong user", async () => {
    expect.hasAssertions();

    const newPost = await caller.createPost({ title });
    await mockUserOnce(mockContext.db);

    await expect(caller.updatePost({ description, id: newPost.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: Post, ${newPost.id}]`,
    );
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const newPost = await caller.createPost({ title });
    const deletedPost = await caller.deletePost(newPost.id);

    expect(deletedPost.id).toBe(newPost.id);
  });

  test("fails delete with non-existent id", async () => {
    expect.hasAssertions();

    await expect(caller.deletePost(NIL)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Delete, name: Post, 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test("fails delete with wrong user", async () => {
    expect.hasAssertions();

    const newPost = await caller.createPost({ title });
    await mockUserOnce(mockContext.db);

    await expect(caller.deletePost(newPost.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Delete, name: Post, ${newPost.id}]`,
    );
  });

  test("creates comment", async () => {
    expect.hasAssertions();

    const newPost = await caller.createPost({ title });
    const newComment = await caller.createComment({ description, parentId: newPost.id });
    const readPost = await caller.readPost(newPost.id);

    expect(newComment.description).toBe(description);
    expect(readPost.noComments).toBe(1);
  });

  test("reads comment", async () => {
    expect.hasAssertions();

    const newPost = await caller.createPost({ title });
    const newComment = await caller.createComment({ description, parentId: newPost.id });
    const readComment = await caller.readPost(newComment.id);

    expect(readComment).toStrictEqual(newComment);
  });

  test("fails create comment with non-existent parent id", async () => {
    expect.hasAssertions();

    await expect(caller.createComment({ description, parentId: NIL })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Post is not found for id: 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test("updates comment", async () => {
    expect.hasAssertions();

    const newPost = await caller.createPost({ title });
    const newComment = await caller.createComment({ description, parentId: newPost.id });
    const updatedComment = await caller.updateComment({ description: updatedDescription, id: newComment.id });

    expect(updatedComment.description).toBe(updatedDescription);
  });

  test("fails update comment with non-existent id", async () => {
    expect.hasAssertions();

    await expect(caller.updateComment({ description, id: NIL })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: Comment, 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test("fails update comment with wrong user", async () => {
    expect.hasAssertions();

    const newPost = await caller.createPost({ title });
    const newComment = await caller.createComment({ description, parentId: newPost.id });
    await mockUserOnce(mockContext.db);

    await expect(caller.updateComment({ description, id: newComment.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: Comment, ${newComment.id}]`,
    );
  });

  test("deletes comment", async () => {
    expect.hasAssertions();

    const newPost = await caller.createPost({ title });
    const newComment = await caller.createComment({ description, parentId: newPost.id });
    const deletedComment = await caller.deleteComment(newComment.id);
    const readPost = await caller.readPost(newPost.id);

    expect(deletedComment.id).toBe(newComment.id);
    expect(readPost.noComments).toBe(0);
  });

  test("deletes comment with deleting post", async () => {
    expect.hasAssertions();

    const newPost = await caller.createPost({ title });
    const newComment = await caller.createComment({ description, parentId: newPost.id });
    await caller.deletePost(newPost.id);

    await expect(caller.readPost(newComment.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Post is not found for id: ${newComment.id}]`,
    );
  });

  test("fails delete comment with non-existent id", async () => {
    expect.hasAssertions();

    await expect(caller.deleteComment(NIL)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Delete, name: Comment, 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test("fails delete comment with wrong user", async () => {
    expect.hasAssertions();

    const newPost = await caller.createPost({ title });
    const newComment = await caller.createComment({ description, parentId: newPost.id });
    await mockUserOnce(mockContext.db);

    await expect(caller.deleteComment(newComment.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Delete, name: Comment, ${newComment.id}]`,
    );
  });

  test("fails delete comment with post id", async () => {
    expect.hasAssertions();

    const newPost = await caller.createPost({ title });

    await expect(caller.deleteComment(newPost.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Delete, name: Comment, ${newPost.id}]`,
    );
  });
});
