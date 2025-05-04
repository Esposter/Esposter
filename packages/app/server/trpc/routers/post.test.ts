import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { postRouter } from "@@/server/trpc/routers/post";
import { NIL } from "@esposter/shared";
import { beforeEach, describe, expect, test } from "vitest";

describe("post", () => {
  let caller: DecorateRouterRecord<TRPCRouter["post"]>;

  beforeEach(async () => {
    const createCaller = createCallerFactory(postRouter);
    const mockContext = await createMockContext();
    caller = createCaller(mockContext);
  });

  test("creates", async () => {
    expect.hasAssertions();

    const title = "title";
    const description = "description";
    const newPost = await caller.createPost({ description, title });

    expect(newPost.title).toBe(title);
    expect(newPost.description).toBe(description);
  });

  test("reads", async () => {
    expect.hasAssertions();

    const title = "title";
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

    const title = "title";
    const newPost = await caller.createPost({ title });
    const updatedTitle = "updatedTitle";
    const updatedPost = await caller.updatePost({ id: newPost.id, title: updatedTitle });

    expect(updatedPost.title).toBe(updatedTitle);
  });

  test("fails update with non-existent id", async () => {
    expect.hasAssertions();

    await expect(caller.updatePost({ id: NIL })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Post is not found for id: 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const title = "title";
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

  test("creates comment", async () => {
    expect.hasAssertions();

    const title = "title";
    const newPost = await caller.createPost({ title });
    const description = "description";
    const newComment = await caller.createComment({ description, parentId: newPost.id });
    const readPost = await caller.readPost(newPost.id);

    expect(newComment.description).toBe(description);
    expect(readPost.noComments).toBe(1);
  });

  test("reads comment", async () => {
    expect.hasAssertions();

    const title = "title";
    const newPost = await caller.createPost({ title });
    const description = "description";
    const newComment = await caller.createComment({ description, parentId: newPost.id });
    const readComment = await caller.readPost(newComment.id);

    expect(readComment).toStrictEqual(newComment);
  });

  test("fails create comment with non-existent parent id", async () => {
    expect.hasAssertions();

    const description = "description";

    await expect(caller.createComment({ description, parentId: NIL })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Post is not found for id: 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test("updates comment", async () => {
    expect.hasAssertions();

    const title = "title";
    const newPost = await caller.createPost({ title });
    const description = "description";
    const newComment = await caller.createComment({ description, parentId: newPost.id });
    const updatedDescription = "updatedDescription";
    const updatedComment = await caller.updateComment({ description: updatedDescription, id: newComment.id });

    expect(updatedComment.description).toBe(updatedDescription);
  });

  test("fails update comment with non-existent id", async () => {
    expect.hasAssertions();

    const description = "description";

    await expect(caller.updateComment({ description, id: NIL })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: Comment, 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test("deletes comment", async () => {
    expect.hasAssertions();

    const title = "title";
    const newPost = await caller.createPost({ title });
    const description = "description";
    const newComment = await caller.createComment({ description, parentId: newPost.id });
    const deletedComment = await caller.deleteComment(newComment.id);
    const readPost = await caller.readPost(newPost.id);

    expect(deletedComment.id).toBe(newComment.id);
    expect(readPost.noComments).toBe(0);
  });

  test("deletes comment with deleting post", async () => {
    expect.hasAssertions();

    const title = "title";
    const newPost = await caller.createPost({ title });
    const description = "description";
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

  test("fails delete comment with post id", async () => {
    expect.hasAssertions();

    const title = "title";
    const newPost = await caller.createPost({ title });

    await expect(caller.deleteComment(newPost.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Delete, name: Comment, ${newPost.id}]`,
    );
  });
});
