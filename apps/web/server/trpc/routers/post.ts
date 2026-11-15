import type { CreatedComment } from "#shared/models/db/post/CreatedComment";
import type { DeletedComment } from "#shared/models/db/post/DeletedComment";
import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import type { PostInPost, PostInPostWithRelations, relations } from "@esposter/db-schema";
import type { RelationsFilter } from "drizzle-orm";

import { ownedBy } from "#server/services/db/ownedBy";
import { getCursorPaginationData } from "#server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "#server/services/pagination/cursor/getCursorWhere";
import { parseSortByToSql } from "#server/services/pagination/sorting/parseSortByToSql";
import { getNotBlockedWhere } from "#server/services/post/getNotBlockedWhere";
import { getPostRanking } from "#server/services/post/getPostRanking";
import { getPostWithViewerLike } from "#server/services/post/getPostWithViewerLike";
import { getViewerPostRelations } from "#server/services/post/getViewerPostRelations";
import { readPostWithRelations } from "#server/services/post/readPostWithRelations";
import { router } from "#server/trpc";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { requireMutation } from "#server/trpc/guards/requireMutation";
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
import { inJsonArray } from "@esposter/db";
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
import { and, eq, isNotNull, isNull, or, sql } from "drizzle-orm";
import { z } from "zod";

// A feed card shows a post's counters and the feed is ranked by them, so every change to a post reaches the feed too
const feedPostsTopic = getTopic(TopicKind.Feed, "posts");
// The topics of the posts a write changed, each under its own name, together with the feed they are all shown in
const getPostTopics = (...postIds: string[]) => [
  ...postIds.map((postId) => getTopic(TopicKind.Post, postId)),
  feedPostsTopic,
];
// The posts whose counters a comment's write moved, as the write's output names them
const getAncestorIds = (output: unknown) =>
  selectPostInPostSchema.pick({ ancestorIds: true }).parse(output).ancestorIds;

export const postRouter = router({
  createComment: getTopicsProcedure(
    getProfanityFilterProcedure(createCommentInputSchema, ["description"]),
    ({ output }) => getPostTopics(...getAncestorIds(output)),
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
  // The comment's own page and each reply's beneath it go with the delete, so every removed post's topic is published
  deleteComment: getTopicsProcedure(standardAuthedProcedure.input(deleteCommentInputSchema), ({ output }) => {
    const { ancestorIds, removedIds } = z
      .object({ ancestorIds: z.array(z.string()), removedIds: z.array(z.string()) })
      .parse(output);
    return getPostTopics(...removedIds, ...ancestorIds);
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
    // The subtree is the comment and every reply beneath it. It is read inside the batch rather than before it: a reply
    // Landing between a read and the delete would otherwise be subtracted from the ancestors without being named. The
    // Read and the counter's own subquery see the same rows, since nothing else writes between them
    const subtreeWhere = or(
      eq(postsInPost.id, input),
      sql`exists (select 1 from json_each(${postsInPost.ancestorIds}) where json_each.value = ${input})`,
    );
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
  // The post and every reply the cascade removes beneath it, each of whose pages goes with the delete
  deletePost: getTopicsProcedure(standardAuthedProcedure.input(deletePostInputSchema), ({ output }) =>
    getPostTopics(...z.array(z.string()).parse(output)),
  ).mutation<PostInPost["id"][]>(async ({ ctx, input }) => {
    const ownedPost = and(ownedBy(postsInPost, input, ctx.user.id), isNull(postsInPost.parentId));
    // Read in the batch with the delete, so a reply landing in between is either named or never written
    const [removedRows, deletedPostRows] = await ctx.db.batch([
      ctx.db
        .select({ id: postsInPost.id })
        .from(postsInPost)
        .where(
          and(
            or(
              eq(postsInPost.id, input),
              sql`exists (select 1 from json_each(${postsInPost.ancestorIds}) where json_each.value = ${input})`,
            ),
            sql`exists (select 1 from ${postsInPost} where ${ownedPost})`,
          ),
        ),
      ctx.db.delete(postsInPost).where(ownedPost).returning({ id: postsInPost.id }),
    ]);
    requireMutation(deletedPostRows[0], Operation.Delete, DatabaseEntityType.Post, input);
    return removedRows.map(({ id }: Pick<PostInPost, "id">) => id);
  }),
  readPost: getTopicsProcedure(standardRateLimitedProcedure.input(readPostInputSchema), ({ input }) => [
    getTopic(TopicKind.Post, input),
  ])
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
    CursorPaginationData<PostInPostWithRelations>
  >(async ({ ctx, input: { cursor, limit, parentId, sortBy, userId: authorId } }) => {
    const userId = ctx.user?.id;
    const where: RelationsFilter<(typeof relations)["postsInPost"], typeof relations> = parentId
      ? { parentId: { eq: parentId } }
      : { parentId: { isNull: true } };
    // Profile feeds scope to a single author — composes with the parentId and cursor clauses
    if (authorId) where.userId = { eq: authorId };
    if (cursor || userId)
      where.RAW = (post) => {
        const rawWhere = and(
          cursor ? getCursorWhere(post, cursor, sortBy) : undefined,
          // Only feeds filter blocked users — `readPost` stays readable since navigating
          // Directly to a blocked user's post is an intentional act
          userId ? getNotBlockedWhere(post, ctx.db, userId) : undefined,
        );
        if (!rawWhere)
          throw getInvalidOperationError(Operation.Read, DatabaseEntityType.Post, JSON.stringify({ cursor }));
        return rawWhere;
      };
    const resultPosts = await ctx.db.query.postsInPost.findMany({
      limit: limit + 1,
      orderBy: (post) => parseSortByToSql(post, sortBy),
      where,
      with: userId ? getViewerPostRelations(userId) : PostInPostRelations,
    });
    return getCursorPaginationData(
      resultPosts.map((post) => getPostWithViewerLike(post)),
      limit,
      sortBy,
    );
  }),
  updateComment: getTopicsProcedure(
    getProfanityFilterProcedure(updateCommentInputSchema, ["description"]),
    ({ input }) => getPostTopics(input.id),
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
    ({ input }) => getPostTopics(input.id),
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
