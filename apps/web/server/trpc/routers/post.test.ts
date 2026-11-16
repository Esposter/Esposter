import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers/index";
import type { PostInPost } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { MockPublishedTopics } from "#server/services/realtime/publishTopics.test";
import { createMockAuthSession, createMockCaller, createMockContext } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { blockRouter } from "#server/trpc/routers/block";
import { likeRouter } from "#server/trpc/routers/like";
import { postRouter } from "#server/trpc/routers/post";
import { PostSortType } from "#shared/models/post/PostSortType";
import {
  blocksInSocial,
  DatabaseEntityType,
  DerivedDatabaseEntityType,
  getTopic,
  postsInPost,
  PublicUserColumns,
  TopicKind,
} from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
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
  const value = 1;

  beforeAll(async () => {
    mockContext = await createMockContext();
    postCaller = createCallerFactory(postRouter)(mockContext);
    likeCaller = createCallerFactory(likeRouter)(mockContext);
    blockCaller = createCallerFactory(blockRouter)(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(postsInPost);
    await mockContext.db.delete(blocksInSocial);
  });

  test("creates", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ description, title });

    expect(newPost.title).toBe(title);
    expect(newPost.description).toBe(description);
  });

  // The feed is public, so an author rides along with only what anyone may see of them — never their email
  test("reads", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const post = await postCaller.readPost(newPost.id);

    expect(post).toStrictEqual(newPost);
    expect(Object.keys(post.user).toSorted()).toStrictEqual(Object.keys(PublicUserColumns).toSorted());
  });

  test("reads empty posts", async () => {
    expect.hasAssertions();

    const postsPage = await postCaller.readPosts();

    expect(postsPage).toStrictEqual({ items: [], nextCursor: "" });
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
    const wrongUserCaller = await createMockCaller(postRouter, await createMockAuthSession(mockContext.db));

    await expect(
      wrongUserCaller.updatePost({ description, id: newPost.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.Post, newPost.id).message}]`,
    );
  });

  test("creates a comment under the id the client gives it", async () => {
    expect.hasAssertions();

    const id = v7();
    const newPost = await postCaller.createPost({ title });
    const { comment: newComment } = await postCaller.createComment({ description, id, parentId: newPost.id });

    expect(newComment.id).toBe(id);
  });

  test("fails update with comment id", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const { comment: newComment } = await postCaller.createComment({ description, id: v7(), parentId: newPost.id });

    await expect(postCaller.updatePost({ description, id: newComment.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.Post, newComment.id).message}]`,
    );
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const { comment: newComment } = await postCaller.createComment({ description, id: v7(), parentId: newPost.id });
    MockPublishedTopics.length = 0;
    const removedIds = await postCaller.deletePost(newPost.id);

    expect(removedIds.toSorted((firstId, secondId) => firstId.localeCompare(secondId))).toStrictEqual(
      [newComment.id, newPost.id].toSorted((firstId, secondId) => firstId.localeCompare(secondId)),
    );
    // A reply's own page goes with the cascade, so its topic is published with the post's
    expect(MockPublishedTopics).toContain(getTopic(TopicKind.Post, newComment.id));
    await expect(postCaller.readPost(newPost.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Post, newPost.id).message}]`,
    );
  });

  test("fails delete with wrong user", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const wrongUserCaller = await createMockCaller(postRouter, await createMockAuthSession(mockContext.db));

    await expect(wrongUserCaller.deletePost(newPost.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.Post, newPost.id).message}]`,
    );
  });

  test("creates comment", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const { comment: newComment } = await postCaller.createComment({ description, id: v7(), parentId: newPost.id });
    const post = await postCaller.readPost(newPost.id);
    const comment = await postCaller.readPost(newComment.id);

    expect(newComment.description).toBe(description);
    expect(post.commentCount).toBe(1);
    expect(comment).toStrictEqual(newComment);
  });

  test("reads the counts of several posts in one call", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const otherPost = await postCaller.createPost({ title });
    await postCaller.createComment({ description, id: v7(), parentId: newPost.id });
    const postCounts = await postCaller.readPostCounts([newPost.id, otherPost.id]);

    expect(Object.fromEntries(postCounts.map(({ commentCount, id }) => [id, commentCount]))).toStrictEqual({
      [newPost.id]: 1,
      [otherPost.id]: 0,
    });
  });

  test("updates comment", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const { comment: newComment } = await postCaller.createComment({ description, id: v7(), parentId: newPost.id });
    const updatedComment = await postCaller.updateComment({ description: updatedDescription, id: newComment.id });

    expect(updatedComment.description).toBe(updatedDescription);
  });

  test("fails update comment with wrong user", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const { comment: newComment } = await postCaller.createComment({ description, id: v7(), parentId: newPost.id });
    const wrongUserCaller = await createMockCaller(postRouter, await createMockAuthSession(mockContext.db));

    await expect(
      wrongUserCaller.updateComment({ description, id: newComment.id }),
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
    const { comment: newComment } = await postCaller.createComment({ description, id: v7(), parentId: newPost.id });
    const deletedComment = await postCaller.deleteComment(newComment.id);
    const post = await postCaller.readPost(newPost.id);

    expect(deletedComment.removedIds).toHaveLength(1);
    expect(post.commentCount).toBe(0);
  });

  // A reply is a comment on a comment, so a counter that stopped at direct children would leave a feed card
  // Reporting three where the thread holds thirty
  test("counts a reply on every post above it", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const { comment: newComment } = await postCaller.createComment({ description, id: v7(), parentId: newPost.id });
    const { comment: newReply } = await postCaller.createComment({ description, id: v7(), parentId: newComment.id });
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
    const { comment: newComment } = await postCaller.createComment({ description, id: v7(), parentId: newPost.id });
    const { comment: newReply } = await postCaller.createComment({ description, id: v7(), parentId: newComment.id });
    await postCaller.createComment({ description, id: v7(), parentId: newReply.id });

    MockPublishedTopics.length = 0;
    const deletedComment = await postCaller.deleteComment(newComment.id);
    const post = await postCaller.readPost(newPost.id);

    expect(deletedComment.removedIds).toHaveLength(3);
    expect(post.commentCount).toBe(0);
    // A reply's own page goes with the cascade, so its topic is published with the comment's
    expect(MockPublishedTopics).toContain(getTopic(TopicKind.Post, newReply.id));
  });

  test("deletes comment with deleting post", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const { comment: newComment } = await postCaller.createComment({ description, id: v7(), parentId: newPost.id });
    await postCaller.deletePost(newPost.id);

    await expect(postCaller.readPost(newComment.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Post, newComment.id).message}]`,
    );
  });

  test("fails delete comment with wrong user", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const { comment: newComment } = await postCaller.createComment({ description, id: v7(), parentId: newPost.id });
    const wrongUserCaller = await createMockCaller(postRouter, await createMockAuthSession(mockContext.db));

    await expect(wrongUserCaller.deleteComment(newComment.id)).rejects.toThrowErrorMatchingInlineSnapshot(
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
    const newLike = await likeCaller.createLike({ postId: newPost.id, value });
    const post = await postCaller.readPost(newPost.id);
    const { items } = await postCaller.readPosts();

    expect(post.viewerLike).toStrictEqual(newLike);
    expect(takeOne(items).viewerLike).toStrictEqual(newLike);
  });

  test("reads no viewer like for other user", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    await likeCaller.createLike({ postId: newPost.id, value });
    const otherUserCaller = await createMockCaller(postRouter, await createMockAuthSession(mockContext.db));
    const post = await otherUserCaller.readPost(newPost.id);

    expect(post.viewerLike).toBeUndefined();
  });

  test("reads posts excluding blocked users' posts", async () => {
    expect.hasAssertions();

    const blockedAuthSession = await createMockAuthSession(mockContext.db);
    const blockedCaller = await createMockCaller(postRouter, blockedAuthSession);
    await blockedCaller.createPost({ title });
    const newPost = await postCaller.createPost({ title });
    await blockCaller.createBlock(blockedAuthSession.user.id);
    const { items } = await postCaller.readPosts();

    expect(items.map(({ id }) => id)).toStrictEqual([newPost.id]);
  });

  test("reads comments excluding blocked users' comments", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const blockedAuthSession = await createMockAuthSession(mockContext.db);
    const blockedCaller = await createMockCaller(postRouter, blockedAuthSession);
    await blockedCaller.createComment({ description, id: v7(), parentId: newPost.id });
    await blockCaller.createBlock(blockedAuthSession.user.id);
    const { items: comments } = await postCaller.readPosts({ parentId: newPost.id });
    const post = await postCaller.readPost(newPost.id);

    expect(comments).toStrictEqual([]);
    // Blocked users' comments are hidden, not erased — the denormalized counter keeps counting them
    expect(post.commentCount).toBe(1);
  });

  test("reads posts filtered by user excluding comments", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const authorAuthSession = await createMockAuthSession(mockContext.db);
    const authorCaller = await createMockCaller(postRouter, authorAuthSession);
    const authorPost = await authorCaller.createPost({ title });
    await authorCaller.createComment({ description, id: v7(), parentId: newPost.id });
    const { items } = await postCaller.readPosts({ userId: authorAuthSession.user.id });

    expect(items.map(({ id }) => id)).toStrictEqual([authorPost.id]);
  });

  test("reads blocked user's post by id", async () => {
    expect.hasAssertions();

    const blockedAuthSession = await createMockAuthSession(mockContext.db);
    const blockedCaller = await createMockCaller(postRouter, blockedAuthSession);
    const blockedPost = await blockedCaller.createPost({ title });
    await blockCaller.createBlock(blockedAuthSession.user.id);
    const post = await postCaller.readPost(blockedPost.id);

    expect(post).toStrictEqual(blockedPost);
  });

  test("reads posts sorted by top with cursor", async () => {
    expect.hasAssertions();

    const firstPost = await postCaller.createPost({ title });
    const secondPost = await postCaller.createPost({ title });
    await likeCaller.createLike({ postId: secondPost.id, value });
    const firstPage = await postCaller.readPosts({ limit: 1, sortName: PostSortType.Top });
    const secondPage = await postCaller.readPosts({
      cursor: firstPage.nextCursor,
      limit: 1,
      sortName: PostSortType.Top,
    });

    expect(firstPage.items.map(({ id }) => id)).toStrictEqual([secondPost.id]);
    expect(secondPage.items.map(({ id }) => id)).toStrictEqual([firstPost.id]);
  });

  test("paginates tied sort values without skipping", async () => {
    expect.hasAssertions();

    const newPostIds = await Promise.all(
      Array.from({ length: 3 }, async () => (await postCaller.createPost({ title })).id),
    );
    const firstPage = await postCaller.readPosts({ limit: 2, sortName: PostSortType.Top });
    const secondPage = await postCaller.readPosts({
      cursor: firstPage.nextCursor,
      limit: 2,
      sortName: PostSortType.Top,
    });

    expect(
      [...firstPage.items, ...secondPage.items]
        .map(({ id }) => id)
        .toSorted((firstId, secondId) => firstId.localeCompare(secondId)),
    ).toStrictEqual(newPostIds.toSorted((firstId, secondId) => firstId.localeCompare(secondId)));
  });

  // Replies are created together and then given the columns each sort reads, so every sort reads a different
  // Order from the one creation left
  const ONE_SECOND = Temporal.Duration.from({ seconds: 1 }).total("milliseconds");
  const TWO_SECONDS = Temporal.Duration.from({ seconds: 2 }).total("milliseconds");
  // Three replies, so each is known to exist by its position
  const createReplies = async (parentId: string) => {
    const replyIds = await Promise.all(
      Array.from(
        { length: 3 },
        async () => (await postCaller.createComment({ description, id: v7(), parentId })).comment.id,
      ),
    );
    return [takeOne(replyIds, 0), takeOne(replyIds, 1), takeOne(replyIds, 2)] as const;
  };
  const setReplyColumns = (id: string, columns: Partial<Pick<PostInPost, "createdAt" | "likeCount" | "ranking">>) =>
    mockContext.db.update(postsInPost).set(columns).where(eq(postsInPost.id, id));

  test("hot keeps the ranked reply order", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const [firstId, secondId, thirdId] = await createReplies(newPost.id);
    await setReplyColumns(firstId, { ranking: 0.1 });
    await setReplyColumns(secondId, { ranking: -1 });
    await setReplyColumns(thirdId, { ranking: 0 });
    const { items } = await postCaller.readPosts({ parentId: newPost.id, sortName: PostSortType.Hot });

    expect(items.map(({ id }) => id)).toStrictEqual([firstId, thirdId, secondId]);
  });

  test("top lists the most-liked reply first", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const [firstId, secondId, thirdId] = await createReplies(newPost.id);
    await setReplyColumns(secondId, { likeCount: 2 });
    await setReplyColumns(thirdId, { likeCount: 1 });
    const { items } = await postCaller.readPosts({ parentId: newPost.id, sortName: PostSortType.Top });

    expect(items.map(({ id }) => id)).toStrictEqual([secondId, thirdId, firstId]);
  });

  test("new lists the newest reply first", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const [firstId, secondId, thirdId] = await createReplies(newPost.id);
    await setReplyColumns(firstId, { createdAt: new Date(0) });
    await setReplyColumns(secondId, { createdAt: new Date(ONE_SECOND) });
    await setReplyColumns(thirdId, { createdAt: new Date(TWO_SECONDS) });
    const { items } = await postCaller.readPosts({ parentId: newPost.id, sortName: PostSortType.New });

    expect(items.map(({ id }) => id)).toStrictEqual([thirdId, secondId, firstId]);
  });

  test("old lists the oldest reply first", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const [firstId, secondId, thirdId] = await createReplies(newPost.id);
    await setReplyColumns(firstId, { createdAt: new Date(0) });
    await setReplyColumns(secondId, { createdAt: new Date(ONE_SECOND) });
    await setReplyColumns(thirdId, { createdAt: new Date(TWO_SECONDS) });
    const { items } = await postCaller.readPosts({ parentId: newPost.id, sortName: PostSortType.Old });

    expect(items.map(({ id }) => id)).toStrictEqual([firstId, secondId, thirdId]);
  });

  test("paging Old reaches every reply once", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const [firstId, secondId, thirdId] = await createReplies(newPost.id);
    await setReplyColumns(firstId, { createdAt: new Date(0) });
    await setReplyColumns(secondId, { createdAt: new Date(ONE_SECOND) });
    await setReplyColumns(thirdId, { createdAt: new Date(TWO_SECONDS) });
    const firstPage = await postCaller.readPosts({ limit: 2, parentId: newPost.id, sortName: PostSortType.Old });
    const secondPage = await postCaller.readPosts({
      cursor: firstPage.nextCursor,
      limit: 2,
      parentId: newPost.id,
      sortName: PostSortType.Old,
    });

    expect([...firstPage.items, ...secondPage.items].map(({ id }) => id)).toStrictEqual([firstId, secondId, thirdId]);
  });
});
