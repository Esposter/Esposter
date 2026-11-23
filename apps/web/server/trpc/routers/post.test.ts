import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers/index";
import type { PostInPost } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import {
  createMockAuthSession,
  createMockCaller,
  createMockContext,
  createMockOtherUserCaller,
} from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { getUncoveredWrites } from "#server/trpc/optimisticWriteCrossCheck.test";
import { blockRouter } from "#server/trpc/routers/block";
import { likeRouter } from "#server/trpc/routers/like";
import { postRouter } from "#server/trpc/routers/post";
import { PostSortType } from "#shared/models/post/PostSortType";
import { postTable } from "#src/services/post/overlay/constants";
import { getPostPatchEntry } from "#src/services/post/overlay/getPostPatchEntry";
import { getSetPostEntry } from "#src/services/post/overlay/getSetPostEntry";
import {
  blocksInSocial,
  DatabaseEntityType,
  DerivedDatabaseEntityType,
  postsInPost,
  PublicUserColumns,
} from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

// The id is the last key every sort ends on, so the order of two rows that tie on the sort's own key is the ids' order
const compareById = (first: Pick<PostInPost, "id">, second: Pick<PostInPost, "id">) => (second.id < first.id ? -1 : 1);

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
    vi.restoreAllMocks();
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

  // The edit's entry is the one the store issues, and the one post the edit changes is the row the entry shows
  test("the update entry covers every row the edit names", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const { named, uncovered } = await getUncoveredWrites({
      call: (context) => createCallerFactory(postRouter)(context).updatePost({ id: newPost.id, title: updatedTitle }),
      context: mockContext,
      entry: getPostPatchEntry(newPost.id, { title: updatedTitle }),
      path: "updatePost",
      tables: [postTable],
    });

    expect(named).toHaveLength(1);
    expect(uncovered).toStrictEqual([]);
  });

  test("fails update with a user who is not the author", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const wrongUserCaller = await createMockOtherUserCaller(postRouter, mockContext.db);

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
    const removedPosts = await postCaller.deletePost(newPost.id);

    expect(
      removedPosts.map(({ id }) => id).toSorted((firstId, secondId) => firstId.localeCompare(secondId)),
    ).toStrictEqual([newComment.id, newPost.id].toSorted((firstId, secondId) => firstId.localeCompare(secondId)));
    await expect(postCaller.readPost(newPost.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Post, newPost.id).message}]`,
    );
  });

  // The client holds each removed post by its id, so the removal answers the tombstone of every post it removed, at the
  // Version the removal left, with its text cleared so no reader is handed the removed words
  test("answers the removal with each removed post as a tombstone at the version it leaves", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ description, title });
    const [removedPost] = await postCaller.deletePost(newPost.id);

    expect({
      deletedAt: removedPost?.deletedAt instanceof Date,
      description: removedPost?.description,
      title: removedPost?.title,
      version: removedPost?.version,
    }).toStrictEqual({ deletedAt: true, description: "", title: "", version: 1 });
  });

  // A reply to a removed post would hang under a row no reader can show, so the reply is refused as a missing post
  test("refuses a reply to a removed post", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    await postCaller.deletePost(newPost.id);

    await expect(
      postCaller.createComment({ description, id: v7(), parentId: newPost.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Post, newPost.id).message}]`,
    );
  });

  // The parent is read ahead of the reply's batch, so a removal between the two must still refuse the reply,
  // Rather than hang it under a post no reader can show
  test("refuses a reply to a post a removal takes between the read and the write", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const batch = mockContext.db.batch.bind(mockContext.db);
    vi.spyOn(mockContext.db, "batch").mockImplementationOnce(async (queries) => {
      await postCaller.deletePost(newPost.id);
      return batch(queries);
    });

    await expect(
      postCaller.createComment({ description, id: v7(), parentId: newPost.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Post, newPost.id).message}]`,
    );
    const replies = await mockContext.db.select().from(postsInPost).where(eq(postsInPost.parentId, newPost.id));

    expect(replies).toStrictEqual([]);
  });

  // A feed page names a removed post as a tombstone, so a reader that holds the post drops it on its next read
  test("reads a removed post in its page as a tombstone with no text", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ description, title });
    await postCaller.deletePost(newPost.id);
    const page = await postCaller.readPosts({});

    const { deletedAt, description: pageDescription, id, title: pageTitle } = takeOne(page.items);
    expect({ deletedAt: deletedAt instanceof Date, description: pageDescription, id, title: pageTitle }).toStrictEqual({
      deletedAt: true,
      description: "",
      id: newPost.id,
      title: "",
    });
    expect(page.items).toHaveLength(1);
  });

  test("fails delete with a user who is not the author", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const wrongUserCaller = await createMockOtherUserCaller(postRouter, mockContext.db);

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

  test("fails update comment with a user who is not the author", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const { comment: newComment } = await postCaller.createComment({ description, id: v7(), parentId: newPost.id });
    const wrongUserCaller = await createMockOtherUserCaller(postRouter, mockContext.db);

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

    expect(deletedComment.removedPosts).toHaveLength(1);
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

  // The reply's entry is the one the store issues. The counters it moves sit on the posts above it, which the entry
  // Reaches Through its parent's chain, so a write to any of them queues behind the reply
  test("the reply entry covers every post above it that its create counts", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const { comment: newComment } = await postCaller.createComment({ description, id: v7(), parentId: newPost.id });
    const replyId = v7();
    const { named, uncovered } = await getUncoveredWrites({
      call: (context) =>
        createCallerFactory(postRouter)(context).createComment({ description, id: replyId, parentId: newComment.id }),
      context: mockContext,
      entry: getSetPostEntry({
        ...newComment,
        ancestorIds: [...newComment.ancestorIds, newComment.id],
        depth: newComment.depth + 1,
        id: replyId,
        parentId: newComment.id,
      }),
      path: "createComment",
      tables: [postTable],
    });

    expect(named).toHaveLength(3);
    expect(uncovered).toStrictEqual([]);
  });

  // The delete cascades down the parentId chain, so the rows it removes are gone before anything could count
  // Them — an ancestor losing one would then report replies that no longer exist
  test("takes a deleted comment's whole subtree off every post above it", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const { comment: newComment } = await postCaller.createComment({ description, id: v7(), parentId: newPost.id });
    const { comment: newReply } = await postCaller.createComment({ description, id: v7(), parentId: newComment.id });
    await postCaller.createComment({ description, id: v7(), parentId: newReply.id });

    const deletedComment = await postCaller.deleteComment(newComment.id);
    const post = await postCaller.readPost(newPost.id);

    expect(deletedComment.removedPosts).toHaveLength(3);
    expect(post.commentCount).toBe(0);
  });

  // A reply page reads the replies of its parent by `parentId`, so the delete of that parent takes the page's replies
  // With it, And the page the replies were read from is the one the delete changes
  test("deleting a comment leaves its replies' page as tombstones", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const { comment: newComment } = await postCaller.createComment({ description, id: v7(), parentId: newPost.id });
    await postCaller.createComment({ description, id: v7(), parentId: newComment.id });
    const repliesCaller = createCallerFactory(postRouter)(mockContext);
    const repliesBefore = await repliesCaller.readPosts({ parentId: newComment.id });
    expect(repliesBefore.items).toHaveLength(1);

    await postCaller.deleteComment(newComment.id);

    const repliesAfter = await repliesCaller.readPosts({ parentId: newComment.id });
    expect(repliesAfter.items).toHaveLength(1);
    expect(repliesAfter.items.every(({ deletedAt }) => deletedAt !== null)).toBe(true);
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

  test("fails delete comment with a user who is not the author", async () => {
    expect.hasAssertions();

    const newPost = await postCaller.createPost({ title });
    const { comment: newComment } = await postCaller.createComment({ description, id: v7(), parentId: newPost.id });
    const wrongUserCaller = await createMockOtherUserCaller(postRouter, mockContext.db);

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
    const otherUserCaller = await createMockOtherUserCaller(postRouter, mockContext.db);
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

  // Six root posts with ties on the ranking and on the likes, so every page boundary below falls inside a tie. Each
  // Sort Ends on the id, as PostSortTypePageSortMap names it, so the order is total
  const feedColumns = [
    { likeCount: 2, ranking: 1 },
    { likeCount: 1, ranking: 3 },
    { likeCount: 2, ranking: 3 },
    { likeCount: 2, ranking: 2 },
    { likeCount: 0, ranking: 3 },
    { likeCount: 1, ranking: 1 },
  ];
  const feedOrders = {
    [PostSortType.Hot]: (first: Pick<PostInPost, "id" | "ranking">, second: Pick<PostInPost, "id" | "ranking">) =>
      second.ranking - first.ranking || compareById(first, second),
    [PostSortType.New]: compareById,
    [PostSortType.Top]: (first: Pick<PostInPost, "id" | "likeCount">, second: Pick<PostInPost, "id" | "likeCount">) =>
      second.likeCount - first.likeCount || compareById(first, second),
  };

  test.each([PostSortType.Hot, PostSortType.New, PostSortType.Top])(
    "reads the feed in %s order, with every page boundary inside a tie",
    async (sortName) => {
      expect.hasAssertions();

      const feedPosts = await Promise.all(
        Array.from({ length: feedColumns.length }, () => postCaller.createPost({ title })),
      );
      await Promise.all(feedPosts.map(({ id }, index) => setReplyColumns(id, takeOne(feedColumns, index))));
      const seededPosts = feedPosts.map(({ id }, index) => ({ id, ...takeOne(feedColumns, index) }));
      const firstPage = await postCaller.readPosts({ limit: 2, sortName });
      const secondPage = await postCaller.readPosts({ cursor: firstPage.nextCursor, limit: 2, sortName });
      const thirdPage = await postCaller.readPosts({ cursor: secondPage.nextCursor, limit: 2, sortName });

      expect([...firstPage.items, ...secondPage.items, ...thirdPage.items].map(({ id }) => id)).toStrictEqual(
        seededPosts.toSorted(feedOrders[sortName]).map(({ id }) => id),
      );
    },
  );
});
