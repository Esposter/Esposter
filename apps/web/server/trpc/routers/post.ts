import type { CreatedComment } from "#shared/models/db/post/CreatedComment";
import type { DeletedComment } from "#shared/models/db/post/DeletedComment";
import type { Page, PostInPost, PostInPostWithRelations, relations } from "@esposter/db-schema";
import type { RelationsFilter } from "drizzle-orm";

import { ownedBy } from "#server/services/db/ownedBy";
import { bindPostSort } from "#server/services/post/bindPostSort";
import { getNotBlockedWhere } from "#server/services/post/getNotBlockedWhere";
import { getPostSubtreeWhere } from "#server/services/post/getPostSubtreeWhere";
import { getPostWithViewerLike } from "#server/services/post/getPostWithViewerLike";
import { getViewerPostRelations } from "#server/services/post/getViewerPostRelations";
import { readPostWithRelations } from "#server/services/post/readPostWithRelations";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { router } from "#server/trpc/index";
import { getProfanityFilterProcedure } from "#server/trpc/procedure/getProfanityFilterProcedure";
import { getTopicsProcedure } from "#server/trpc/procedure/getTopicsProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { standardRateLimitedProcedure } from "#server/trpc/procedure/standardRateLimitedProcedure";
import { createCommentInputSchema } from "#shared/models/db/post/CreateCommentInput";
import { createPostInputSchema } from "#shared/models/db/post/CreatePostInput";
import { deleteCommentInputSchema } from "#shared/models/db/post/DeleteCommentInput";
import { deletePostInputSchema } from "#shared/models/db/post/DeletePostInput";
import { readPostCountsInputSchema } from "#shared/models/db/post/ReadPostCountsInput";
import { readPostInputSchema } from "#shared/models/db/post/ReadPostInput";
import { readPostsInputSchema } from "#shared/models/db/post/ReadPostsInput";
import { updateCommentInputSchema } from "#shared/models/db/post/UpdateCommentInput";
import { updatePostInputSchema } from "#shared/models/db/post/UpdatePostInput";
import { getPostRanking } from "#shared/services/post/getPostRanking";
import { getPageOrderBy, getPageWhere, inJsonArray, toPage } from "@esposter/db";
import {
  DatabaseEntityType,
  DerivedDatabaseEntityType,
  getTopic,
  PostInPostRelations,
  postsInPost,
  selectPostInPostSchema,
  TopicKind,
} from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { and, isNotNull, isNull, sql } from "drizzle-orm";
import { z } from "zod";

// A feed card shows a post's counters and the feed is ranked by them, so every change to a post reaches the feed too
const feedPostsTopic = getTopic(TopicKind.Feed, "posts");
const postIdentitySchema = selectPostInPostSchema.pick({ ancestorIds: true, id: true });
// A thread is named by its root post's topic, which every page in the thread watches beside its own.
// So a thread publishes one topic for the whole of it, however deep or large.
// And a write's publish stays a few subrequests however many posts it moved.
const getThreadTopic = (postId: string, ancestorIds: string[]) => getTopic(TopicKind.Post, ancestorIds[0] ?? postId);
// A post's own topic and its thread's, read from the post a procedure answered with
const getPostThreadTopics = (post: unknown) => {
  const { ancestorIds, id } = postIdentitySchema.parse(post);
  return [...new Set([getThreadTopic(id, ancestorIds), getTopic(TopicKind.Post, id)])];
};

export const postRouter = router({
  createComment: getTopicsProcedure(
    getProfanityFilterProcedure(createCommentInputSchema, ["description"]),
    ({ output }) => [...getPostThreadTopics(z.object({ comment: z.unknown() }).parse(output).comment), feedPostsTopic],
  ).mutation<CreatedComment>(async ({ ctx, input }) => {
    const parentPost = await requireEntity(
      ctx.db.query.postsInPost.findFirst({
        columns: { ancestorIds: true, depth: true, id: true },
        where: { id: { eq: input.parentId } },
      }),
      DatabaseEntityType.Post,
      input.parentId,
    );
    // The parent's chain plus the parent itself: what this reply inherits, and the posts whose counters move
    const ancestorIds = [...parentPost.ancestorIds, parentPost.id];
    const createdAt = new Date();
    // The reply and the counter of every ancestor commit in one batch, so no counter counts a reply that did not land
    const [newCommentRows] = await ctx.db.batch([
      ctx.db
        .insert(postsInPost)
        .values({
          ...input,
          ancestorIds,
          createdAt,
          depth: parentPost.depth + 1,
          ranking: getPostRanking(0, createdAt),
          userId: ctx.user.id,
        })
        .returning({ id: postsInPost.id }),
      // Every ancestor, not just the parent: a counter that stops at direct children makes a feed card
      // Under-report its own thread
      ctx.db
        .update(postsInPost)
        .set({ commentCount: sql`${postsInPost.commentCount} + 1` })
        .where(inJsonArray(postsInPost.id, ancestorIds)),
    ]);
    const newComment = requireMutation(
      newCommentRows[0],
      Operation.Create,
      DerivedDatabaseEntityType.Comment,
      JSON.stringify(input),
    );

    return {
      ancestorIds,
      comment: await readPostWithRelations(ctx.db, newComment.id, DerivedDatabaseEntityType.Comment, ctx.user.id),
    };
  }),
  createPost: getTopicsProcedure(getProfanityFilterProcedure(createPostInputSchema, ["title", "description"]), () => [
    feedPostsTopic,
  ]).mutation<PostInPostWithRelations>(async ({ ctx, input }) => {
    const createdAt = new Date();
    const newPost = requireMutation(
      (
        await ctx.db
          .insert(postsInPost)
          .values({ ...input, createdAt, ranking: getPostRanking(0, createdAt), userId: ctx.user.id })
          .returning({ id: postsInPost.id })
      )[0],
      Operation.Create,
      DatabaseEntityType.Post,
      JSON.stringify(input),
    );

    return readPostWithRelations(ctx.db, newPost.id, DatabaseEntityType.Post, ctx.user.id);
  }),
  // The comment's own page, and each reply's beneath it, watch the thread the delete is published to
  deleteComment: getTopicsProcedure(standardAuthedProcedure.input(deleteCommentInputSchema), ({ input, output }) => {
    const { ancestorIds } = selectPostInPostSchema.pick({ ancestorIds: true }).parse(output);
    return [getTopic(TopicKind.Post, input), getThreadTopic(input, ancestorIds), feedPostsTopic];
  }).mutation<DeletedComment>(async ({ ctx, input }) => {
    const userId = ctx.user.id;
    const ownedComment = and(ownedBy(postsInPost, input, userId), isNotNull(postsInPost.parentId));
    // The ancestors are what the counters move, and they never change, so they are read ahead of the batch
    const { ancestorIds } = requireMutation(
      (await ctx.db.select({ ancestorIds: postsInPost.ancestorIds }).from(postsInPost).where(ownedComment))[0],
      Operation.Delete,
      DerivedDatabaseEntityType.Comment,
      input,
    );
    // A reply has its parent among its ancestors, so the first of them is the thread its subtree lies in
    const threadRootId = ancestorIds.at(0);
    if (!threadRootId)
      throw getInvalidOperationError(Operation.Delete, DerivedDatabaseEntityType.Comment, JSON.stringify(input));
    // The subtree is the comment and every reply beneath it. It is read inside the batch rather than before it: a reply
    // Landing between a read and the delete would otherwise be subtracted from the ancestors without being named. The
    // Read and the counter's own subquery see the same rows, since nothing else writes between them
    const subtreeWhere = getPostSubtreeWhere(input, threadRootId);
    const [removedRows, , deletedCommentRows] = await ctx.db.batch([
      ctx.db.select({ id: postsInPost.id }).from(postsInPost).where(subtreeWhere),
      // Every ancestor loses the whole subtree; the guard leaves the counters alone when the delete below will not land
      ctx.db
        .update(postsInPost)
        .set({
          commentCount: sql`${postsInPost.commentCount} - (select count(*) from ${postsInPost} where ${subtreeWhere})`,
        })
        .where(
          and(
            inJsonArray(postsInPost.id, ancestorIds),
            sql`exists (select 1 from ${postsInPost} where ${ownedComment})`,
          ),
        ),
      ctx.db.delete(postsInPost).where(ownedComment).returning({ id: postsInPost.id }),
    ]);
    requireMutation(deletedCommentRows[0], Operation.Delete, DerivedDatabaseEntityType.Comment, input);
    return { ancestorIds, removedIds: removedRows.map(({ id }: Pick<PostInPost, "id">) => id) };
  }),
  // The post is its thread's root, so every reply the cascade removes has a page watching this one topic
  deletePost: getTopicsProcedure(standardAuthedProcedure.input(deletePostInputSchema), ({ input }) => [
    getTopic(TopicKind.Post, input),
    feedPostsTopic,
  ]).mutation<PostInPost["id"][]>(async ({ ctx, input }) => {
    const ownedPost = and(ownedBy(postsInPost, input, ctx.user.id), isNull(postsInPost.parentId));
    // Read in the batch with the delete, so a reply landing in between is either named or never written
    const [removedRows, deletedPostRows] = await ctx.db.batch([
      ctx.db
        .select({ id: postsInPost.id })
        .from(postsInPost)
        .where(and(getPostSubtreeWhere(input, input), sql`exists (select 1 from ${postsInPost} where ${ownedPost})`)),
      ctx.db.delete(postsInPost).where(ownedPost).returning({ id: postsInPost.id }),
    ]);
    requireMutation(deletedPostRows[0], Operation.Delete, DatabaseEntityType.Post, input);
    return removedRows.map(({ id }: Pick<PostInPost, "id">) => id);
  }),
  readPost: getTopicsProcedure(standardRateLimitedProcedure.input(readPostInputSchema), ({ output }) =>
    getPostThreadTopics(output),
  )
    // The procedure is rate-limited, so a session may be absent — no viewer means no like lookup at all
    .query<PostInPostWithRelations>(({ ctx, input }) =>
      readPostWithRelations(ctx.db, input, DatabaseEntityType.Post, ctx.user?.id),
    ),
  // The counts the server keeps on each post, read in one statement for the posts a client has marked as changed. The
  // Server adjusts a count in the same batch as the write that changes it, so only this read says what it is now
  readPostCounts: getTopicsProcedure(standardRateLimitedProcedure.input(readPostCountsInputSchema), ({ input }) =>
    input.map((postId) => getTopic(TopicKind.Post, postId)),
  ).query<Pick<PostInPost, "commentCount" | "id" | "likeCount">[]>(({ ctx, input }) =>
    ctx.db
      .select({ commentCount: postsInPost.commentCount, id: postsInPost.id, likeCount: postsInPost.likeCount })
      .from(postsInPost)
      .where(inJsonArray(postsInPost.id, input)),
  ),
  readPosts: getTopicsProcedure(standardRateLimitedProcedure.input(readPostsInputSchema), () => [feedPostsTopic]).query<
    Page<PostInPostWithRelations>
  >(async ({ ctx, input: { cursor, limit, parentId, sort, userId: authorId } }) => {
    const userId = ctx.user?.id;
    const where: RelationsFilter<(typeof relations)["postsInPost"], typeof relations> = parentId
      ? { parentId: { eq: parentId } }
      : { parentId: { isNull: true } };
    // Profile feeds scope to a single author — composes with the parentId and cursor clauses
    if (authorId) where.userId = { eq: authorId };
    where.RAW = (post) =>
      and(
        getPageWhere(bindPostSort(post, sort), cursor),
        // Only feeds filter blocked users — `readPost` stays readable since navigating
        // Directly to a blocked user's post is an intentional act
        userId ? getNotBlockedWhere(post, ctx.db, userId) : undefined,
      ) ?? sql`true`;
    const resultPosts = await ctx.db.query.postsInPost.findMany({
      limit: limit + 1,
      orderBy: (post) => getPageOrderBy(bindPostSort(post, sort), cursor),
      where,
      with: userId ? getViewerPostRelations(userId) : PostInPostRelations,
    });
    const page = toPage(resultPosts, sort, cursor, limit);
    return { ...page, items: page.items.map((post) => getPostWithViewerLike(post)) };
  }),
  updateComment: getTopicsProcedure(
    getProfanityFilterProcedure(updateCommentInputSchema, ["description"]),
    ({ output }) => [...getPostThreadTopics(output), feedPostsTopic],
  ).mutation<PostInPostWithRelations>(async ({ ctx, input: { id, ...rest } }) => {
    const updatedComment = requireMutation(
      (
        await ctx.db
          .update(postsInPost)
          .set(rest)
          .where(and(ownedBy(postsInPost, id, ctx.user.id), isNotNull(postsInPost.parentId)))
          .returning({ id: postsInPost.id })
      )[0],
      Operation.Update,
      DerivedDatabaseEntityType.Comment,
      id,
    );

    return readPostWithRelations(ctx.db, updatedComment.id, DerivedDatabaseEntityType.Comment, ctx.user.id);
  }),
  updatePost: getTopicsProcedure(
    getProfanityFilterProcedure(updatePostInputSchema, ["title", "description"]),
    ({ input }) => [getTopic(TopicKind.Post, input.id), feedPostsTopic],
  ).mutation<PostInPostWithRelations>(async ({ ctx, input: { id, ...rest } }) => {
    const updatedPost = requireMutation(
      (
        await ctx.db
          .update(postsInPost)
          .set(rest)
          .where(and(ownedBy(postsInPost, id, ctx.user.id), isNull(postsInPost.parentId)))
          .returning({ id: postsInPost.id })
      )[0],
      Operation.Update,
      DatabaseEntityType.Post,
      id,
    );

    return readPostWithRelations(ctx.db, updatedPost.id, DatabaseEntityType.Post, ctx.user.id);
  }),
});
