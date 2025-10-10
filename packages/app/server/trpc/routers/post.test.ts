import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { postRouter } from "@@/server/trpc/routers/post";
import { posts } from "@esposter/db-schema";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

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

  afterEach(async () => {
    await mockContext.db.delete(posts);
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

    const id = crypto.randomUUID();

    await expect(caller.readPost(id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Post is not found for id: ${id}]`,
    );
  });

  test("reads empty posts", async () => {
    expect.hasAssertions();

    const readPosts = await caller.readPosts();

    expect(readPosts).toStrictEqual(getCursorPaginationData([], 0, []));
  });

  test("updates", async () => {
    expect.hasAssertions();

    const newPost = await caller.createPost({ title });
    const updatedPost = await caller.updatePost({ id: newPost.id, title: updatedTitle });

    expect(updatedPost.title).toBe(updatedTitle);
  });

  test("fails update with non-existent id", async () => {
    expect.hasAssertions();

    const id = crypto.randomUUID();

    await expect(caller.updatePost({ description, id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: Post, ${id}]`,
    );
  });

  test("fails update with wrong user", async () => {
    expect.hasAssertions();

    const newPost = await caller.createPost({ title });
    await mockSessionOnce(mockContext.db);

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

    const id = crypto.randomUUID();

    await expect(caller.deletePost(id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Delete, name: Post, ${id}]`,
    );
  });

  test("fails delete with wrong user", async () => {
    expect.hasAssertions();

    const newPost = await caller.createPost({ title });
    await mockSessionOnce(mockContext.db);

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

    const parentId = crypto.randomUUID();

    await expect(caller.createComment({ description, parentId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Post is not found for id: ${parentId}]`,
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

    const id = crypto.randomUUID();

    await expect(caller.updateComment({ description, id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: Comment, ${id}]`,
    );
  });

  test("fails update comment with wrong user", async () => {
    expect.hasAssertions();

    const newPost = await caller.createPost({ title });
    const newComment = await caller.createComment({ description, parentId: newPost.id });
    await mockSessionOnce(mockContext.db);

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

    const id = crypto.randomUUID();

    await expect(caller.deleteComment(id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Delete, name: Comment, ${id}]`,
    );
  });

  test("fails delete comment with wrong user", async () => {
    expect.hasAssertions();

    const newPost = await caller.createPost({ title });
    const newComment = await caller.createComment({ description, parentId: newPost.id });
    await mockSessionOnce(mockContext.db);

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
