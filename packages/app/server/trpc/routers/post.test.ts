import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { Post } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { blockRouter } from "@@/server/trpc/routers/block";
import { likeRouter } from "@@/server/trpc/routers/like";
import { postRouter } from "@@/server/trpc/routers/post";
import { blocks, DatabaseEntityType, DerivedDatabaseEntityType, posts } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("postRouter", () => {
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
    const post = await postCaller.readPost(newPost.id);

    expect(post).toStrictEqual(newPost);
  });

  test("reads empty posts", async () => {
    expect.hasAssertions();

    const postsPage = await postCaller.readPosts();

    expect(postsPage).toStrictEqual({ hasMore: false, items: [], nextCursor: "" });
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
    const { comment: newComment } = await postCaller.createComment({ description, parentId: newPost.id });

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
    const { comment: newComment } = await postCaller.createComment({ description, parentId: newPost.id });
    const post = await postCaller.readPost(newPost.id);
    const comment = await postCaller.readPost(newComment.id);

    expect(newComment.description).toBe(description);
    expect(post.commentCount).toBe(1);
    expect(comment).toStrictEqual(newComment);
  });

  test("updates comment", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const { comment: newComment } = await postCaller.createComment({ description, parentId: newPost.id });
    const updatedComment = await postCaller.updateComment({ description: updatedDescription, id: newComment.id });

    expect(updatedComment.description).toBe(updatedDescription);
  });

  test("fails update comment with wrong user", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const { comment: newComment } = await postCaller.createComment({ description, parentId: newPost.id });
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
    const { comment: newComment } = await postCaller.createComment({ description, parentId: newPost.id });
    const deletedComment = await postCaller.deleteComment(newComment.id);
    const post = await postCaller.readPost(newPost.id);

    expect(deletedComment.removedCommentCount).toBe(1);
    expect(post.commentCount).toBe(0);
  });

  // A reply is a comment on a comment, so a counter that stopped at direct children would leave a feed card
  // Reporting three where the thread holds thirty
  test("counts a reply on every post above it", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const { comment: newComment } = await postCaller.createComment({ description, parentId: newPost.id });
    const { comment: newReply } = await postCaller.createComment({ description, parentId: newComment.id });
    const post = await postCaller.readPost(newPost.id);
    const comment = await postCaller.readPost(newComment.id);

    expect(newReply.depth).toBe(2);
    expect(post.commentCount).toBe(2);
    expect(comment.commentCount).toBe(1);
  });

  // The delete cascades down the parentId chain, so the rows it removes are gone before anything could count
  // Them — an ancestor losing one would then report replies that no longer exist
  test("takes a deleted comment's whole subtree off every post above it", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const { comment: newComment } = await postCaller.createComment({ description, parentId: newPost.id });
    const { comment: newReply } = await postCaller.createComment({ description, parentId: newComment.id });
    await postCaller.createComment({ description, parentId: newReply.id });

    const deletedComment = await postCaller.deleteComment(newComment.id);
    const post = await postCaller.readPost(newPost.id);

    expect(deletedComment.removedCommentCount).toBe(3);
    expect(post.commentCount).toBe(0);
  });

  test("deletes comment with deleting post", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const { comment: newComment } = await postCaller.createComment({ description, parentId: newPost.id });
    await postCaller.deletePost(newPost.id);

    await expect(postCaller.readPost(newComment.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Post, newComment.id).message}]`,
    );
  });

  test("fails delete comment with wrong user", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const { comment: newComment } = await postCaller.createComment({ description, parentId: newPost.id });
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
    const post = await postCaller.readPost(newPost.id);
    const { items } = await postCaller.readPosts();

    expect(post.viewerLike).toStrictEqual(newLike);
    expect(takeOne(items, 0).viewerLike).toStrictEqual(newLike);
  });

  test("reads no viewer like for other user", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    await likeCaller.createLike({ postId: newPost.id, value: 1 });
    await mockSessionOnce(mockContext.db);
    const post = await postCaller.readPost(newPost.id);

    expect(post.viewerLike).toBeUndefined();
  });

  test("reads posts excluding blocked users' posts", async () => {
    expect.hasAssertions();

    const { user: blockedUser } = await mockSessionOnce(mockContext.db);
    await postCaller.createPost({ title });
    const newPost = await postCaller.createPost({ title });
    await blockCaller.createBlock(blockedUser.id);
    const { items } = await postCaller.readPosts();

    expect(items.map(({ id }) => id)).toStrictEqual([newPost.id]);
  });

  test("reads comments excluding blocked users' comments", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const { user: blockedUser } = await mockSessionOnce(mockContext.db);
    await postCaller.createComment({ description, parentId: newPost.id });
    await blockCaller.createBlock(blockedUser.id);
    const { items: comments } = await postCaller.readPosts({ parentId: newPost.id });
    const post = await postCaller.readPost(newPost.id);

    expect(comments).toStrictEqual([]);
    // Blocked users' comments are hidden, not erased — the denormalized counter keeps counting them
    expect(post.commentCount).toBe(1);
  });

  test("reads posts filtered by user excluding comments", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const { user: author } = await mockSessionOnce(mockContext.db);
    const authorPost = await postCaller.createPost({ title });
    await mockSessionOnce(mockContext.db, author);
    await postCaller.createComment({ description, parentId: newPost.id });
    const { items } = await postCaller.readPosts({ userId: author.id });

    expect(items.map(({ id }) => id)).toStrictEqual([authorPost.id]);
  });

  test("reads blocked user's post by id", async () => {
    expect.hasAssertions();

    const { user: blockedUser } = await mockSessionOnce(mockContext.db);
    const blockedPost = await postCaller.createPost({ title });
    await blockCaller.createBlock(blockedUser.id);
    const post = await postCaller.readPost(blockedPost.id);

    expect(post.id).toBe(blockedPost.id);
  });

  test("reads posts sorted by top with cursor", async () => {
    expect.hasAssertions();

    const firstPost = await postCaller.createPost({ title });
    const secondPost = await postCaller.createPost({ title });
    await likeCaller.createLike({ postId: secondPost.id, value: 1 });
    const sortBy: SortItem<keyof Post>[] = [
      { key: "likeCount", order: SortOrder.Desc },
      { key: "id", order: SortOrder.Desc },
    ];
    const firstPage = await postCaller.readPosts({ limit: 1, sortBy });
    const secondPage = await postCaller.readPosts({ cursor: firstPage.nextCursor, limit: 1, sortBy });

    expect(firstPage.items.map(({ id }) => id)).toStrictEqual([secondPost.id]);
    expect(secondPage.items.map(({ id }) => id)).toStrictEqual([firstPost.id]);
  });

  test("paginates tied sort values without skipping", async () => {
    expect.hasAssertions();

    const newPostIds: string[] = [];
    for (let i = 0; i < 3; i++) newPostIds.push((await postCaller.createPost({ title })).id);
    const sortBy: SortItem<keyof Post>[] = [
      { key: "likeCount", order: SortOrder.Desc },
      { key: "id", order: SortOrder.Desc },
    ];
    const firstPage = await postCaller.readPosts({ limit: 2, sortBy });
    const secondPage = await postCaller.readPosts({ cursor: firstPage.nextCursor, limit: 2, sortBy });

    expect([...firstPage.items, ...secondPage.items].map(({ id }) => id).toSorted()).toStrictEqual(
      newPostIds.toSorted(),
    );
  });
});
