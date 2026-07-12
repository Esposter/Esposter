import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { Post } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { blockRouter } from "@@/server/trpc/routers/block";
import { likeRouter } from "@@/server/trpc/routers/like";
import { postRouter } from "@@/server/trpc/routers/post";
import { blocks, DatabaseEntityType, DerivedDatabaseEntityType, posts } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("post", () => {
  let mockContext: Context;
  let postCaller: DecorateRouterRecord<TRPCRouter["post"]>;
  let likeCaller: DecorateRouterRecord<TRPCRouter["like"]>;
  let blockCaller: DecorateRouterRecord<TRPCRouter["block"]>;
  const title = "title";
  const updatedTitle = "updatedTitle";
  const description = "description";
  const updatedDescription = "updatedDescription";

  beforeAll(async () => {
    mockContext = await createMockContext();
    postCaller = createCallerFactory(postRouter)(mockContext);
    likeCaller = createCallerFactory(likeRouter)(mockContext);
    blockCaller = createCallerFactory(blockRouter)(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(posts);
    await mockContext.db.delete(blocks);
  });

  test("creates", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ description, title });

    expect(newPost.title).toBe(title);
    expect(newPost.description).toBe(description);
  });

  test("reads", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const readPost = await postCaller.readPost(newPost.id);

    expect(readPost).toStrictEqual(newPost);
  });

  test("reads empty posts", async () => {
    expect.hasAssertions();

    const readPosts = await postCaller.readPosts();

    expect(readPosts).toStrictEqual(getCursorPaginationData([], 0, []));
  });

  test("updates", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const updatedPost = await postCaller.updatePost({ id: newPost.id, title: updatedTitle });

    expect(updatedPost.title).toBe(updatedTitle);
  });

  test("fails update with wrong user", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    await mockSessionOnce(mockContext.db);

    await expect(postCaller.updatePost({ description, id: newPost.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.Post, newPost.id).message}]`,
    );
  });

  test("fails update with comment id", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const newComment = await postCaller.createComment({ description, parentId: newPost.id });

    await expect(postCaller.updatePost({ description, id: newComment.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.Post, newComment.id).message}]`,
    );
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const deletedPost = await postCaller.deletePost(newPost.id);

    expect(deletedPost.id).toBe(newPost.id);
  });

  test("fails delete with wrong user", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    await mockSessionOnce(mockContext.db);

    await expect(postCaller.deletePost(newPost.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.Post, newPost.id).message}]`,
    );
  });

  test("creates comment", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const newComment = await postCaller.createComment({ description, parentId: newPost.id });
    const readPost = await postCaller.readPost(newPost.id);

    expect(newComment.description).toBe(description);
    expect(readPost.noComments).toBe(1);
  });

  test("reads comment", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const newComment = await postCaller.createComment({ description, parentId: newPost.id });
    const readComment = await postCaller.readPost(newComment.id);

    expect(readComment).toStrictEqual(newComment);
  });

  test("updates comment", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const newComment = await postCaller.createComment({ description, parentId: newPost.id });
    const updatedComment = await postCaller.updateComment({ description: updatedDescription, id: newComment.id });

    expect(updatedComment.description).toBe(updatedDescription);
  });

  test("fails update comment with wrong user", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const newComment = await postCaller.createComment({ description, parentId: newPost.id });
    await mockSessionOnce(mockContext.db);

    await expect(
      postCaller.updateComment({ description, id: newComment.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DerivedDatabaseEntityType.Comment, newComment.id).message}]`,
    );
  });

  test("fails update comment with post id", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });

    await expect(postCaller.updateComment({ description, id: newPost.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DerivedDatabaseEntityType.Comment, newPost.id).message}]`,
    );
  });

  test("deletes comment", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const newComment = await postCaller.createComment({ description, parentId: newPost.id });
    const deletedComment = await postCaller.deleteComment(newComment.id);
    const readPost = await postCaller.readPost(newPost.id);

    expect(deletedComment.id).toBe(newComment.id);
    expect(readPost.noComments).toBe(0);
  });

  test("deletes comment with deleting post", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const newComment = await postCaller.createComment({ description, parentId: newPost.id });
    await postCaller.deletePost(newPost.id);

    await expect(postCaller.readPost(newComment.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Post, newComment.id).message}]`,
    );
  });

  test("fails delete comment with wrong user", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const newComment = await postCaller.createComment({ description, parentId: newPost.id });
    await mockSessionOnce(mockContext.db);

    await expect(postCaller.deleteComment(newComment.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DerivedDatabaseEntityType.Comment, newComment.id).message}]`,
    );
  });

  test("fails delete comment with post id", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });

    await expect(postCaller.deleteComment(newPost.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DerivedDatabaseEntityType.Comment, newPost.id).message}]`,
    );
  });

  test("reads viewer like", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const newLike = await likeCaller.createLike({ postId: newPost.id, value: 1 });
    const readPost = await postCaller.readPost(newPost.id);
    const readPosts = await postCaller.readPosts();

    expect(readPost.viewerLike).toStrictEqual(newLike);
    expect(takeOne(readPosts.items, 0).viewerLike).toStrictEqual(newLike);
  });

  test("reads no viewer like for other user", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    await likeCaller.createLike({ postId: newPost.id, value: 1 });
    await mockSessionOnce(mockContext.db);
    const readPost = await postCaller.readPost(newPost.id);

    expect(readPost.viewerLike).toBeUndefined();
  });

  test("reads posts excluding blocked users' posts", async () => {
    expect.hasAssertions();

    const { user: blockedUser } = await mockSessionOnce(mockContext.db);
    await postCaller.createPost({ title });
    const newPost = await postCaller.createPost({ title });
    await blockCaller.blockUser(blockedUser.id);
    const readPosts = await postCaller.readPosts();

    expect(readPosts.items.map(({ id }) => id)).toStrictEqual([newPost.id]);
  });

  test("reads comments excluding blocked users' comments", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const { user: blockedUser } = await mockSessionOnce(mockContext.db);
    await postCaller.createComment({ description, parentId: newPost.id });
    await blockCaller.blockUser(blockedUser.id);
    const readComments = await postCaller.readPosts({ parentId: newPost.id });
    const readPost = await postCaller.readPost(newPost.id);

    expect(readComments.items).toStrictEqual([]);
    // Blocked users' comments are hidden, not erased — the denormalized counter keeps counting them
    expect(readPost.noComments).toBe(1);
  });

  test("reads blocked user's post by id", async () => {
    expect.hasAssertions();

    const { user: blockedUser } = await mockSessionOnce(mockContext.db);
    const blockedPost = await postCaller.createPost({ title });
    await blockCaller.blockUser(blockedUser.id);
    const readPost = await postCaller.readPost(blockedPost.id);

    expect(readPost.id).toBe(blockedPost.id);
  });

  test("reads posts sorted by top with cursor", async () => {
    expect.hasAssertions();

    const firstPost = await postCaller.createPost({ title });
    const secondPost = await postCaller.createPost({ title });
    await likeCaller.createLike({ postId: secondPost.id, value: 1 });
    const sortBy: SortItem<keyof Post>[] = [
      { key: "noLikes", order: SortOrder.Desc },
      { key: "id", order: SortOrder.Desc },
    ];
    const firstPage = await postCaller.readPosts({ limit: 1, sortBy });
    const secondPage = await postCaller.readPosts({ cursor: firstPage.nextCursor, limit: 1, sortBy });

    expect(firstPage.items.map(({ id }) => id)).toStrictEqual([secondPost.id]);
    expect(firstPage.hasMore).toBe(true);
    expect(secondPage.items.map(({ id }) => id)).toStrictEqual([firstPost.id]);
    expect(secondPage.hasMore).toBe(false);
  });

  test("paginates tied sort values without skipping", async () => {
    expect.hasAssertions();

    const newPostIds: string[] = [];
    for (let i = 0; i < 3; i++) newPostIds.push((await postCaller.createPost({ title })).id);
    const sortBy: SortItem<keyof Post>[] = [
      { key: "noLikes", order: SortOrder.Desc },
      { key: "id", order: SortOrder.Desc },
    ];
    const firstPage = await postCaller.readPosts({ limit: 2, sortBy });
    const secondPage = await postCaller.readPosts({ cursor: firstPage.nextCursor, limit: 2, sortBy });

    expect([...firstPage.items, ...secondPage.items].map(({ id }) => id).toSorted()).toStrictEqual(
      newPostIds.toSorted(),
    );
  });
});
