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
import { DatabaseEntityType, DerivedDatabaseEntityType, PostInPostRelations, postsInPost } from "@esposter/db-schema";
import { Operation, takeOne } from "@esposter/shared";
import { and, count, eq, isNotNull, isNull, or, sql } from "drizzle-orm";

export const postRouter = router({
  createComment: getProfanityFilterProcedure(createCommentInputSchema, ["description"]).mutation<CreatedComment>(
    async ({ ctx, input }) => {
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
            userId: ctx.getSessionPayload.user.id,
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
        comment: await readPostWithRelations(
          ctx.db,
          newComment.id,
          DerivedDatabaseEntityType.Comment,
          ctx.getSessionPayload.user.id,
        ),
      };
    },
  ),
  createPost: getProfanityFilterProcedure(createPostInputSchema, [
    "title",
    "description",
  ]).mutation<PostInPostWithRelations>(async ({ ctx, input }) => {
    const createdAt = new Date();
    const newPost = requireMutation(
      (
        await ctx.db
          .insert(postsInPost)
          .values({ ...input, createdAt, ranking: getPostRanking(0, createdAt), userId: ctx.getSessionPayload.user.id })
          .returning({ id: postsInPost.id })
      )[0],
      Operation.Create,
      DatabaseEntityType.Post,
      JSON.stringify(input),
    );

    return readPostWithRelations(ctx.db, newPost.id, DatabaseEntityType.Post, ctx.getSessionPayload.user.id);
  }),
  deleteComment: standardAuthedProcedure
    .input(deleteCommentInputSchema)
    .mutation<DeletedComment>(async ({ ctx, input }) => {
      const userId = ctx.getSessionPayload.user.id;
      const ownedComment = and(ownedBy(postsInPost, input, userId), isNotNull(postsInPost.parentId));
      // The ancestors are what the counters move, and they never change, so they are read ahead of the batch
      const { ancestorIds } = requireMutation(
        (await ctx.db.select({ ancestorIds: postsInPost.ancestorIds }).from(postsInPost).where(ownedComment))[0],
        Operation.Delete,
        DerivedDatabaseEntityType.Comment,
        input,
      );
      // The subtree is the comment and every reply beneath it. It is counted inside the batch rather than read before
      // It: a reply landing between a read and the delete would otherwise be subtracted from the ancestors without being
      // Counted. The count and the counter's own subquery see the same rows, since nothing else writes between them
      const subtreeWhere = or(
        eq(postsInPost.id, input),
        sql`exists (select 1 from json_each(${postsInPost.ancestorIds}) where json_each.value = ${input})`,
      );
      const [countRows, , deletedCommentRows] = await ctx.db.batch([
        ctx.db.select({ removedCommentCount: count() }).from(postsInPost).where(subtreeWhere),
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
      const { removedCommentCount } = takeOne(countRows, 0);
      return { ancestorIds, removedCommentCount };
    }),
  deletePost: standardAuthedProcedure.input(deletePostInputSchema).mutation<PostInPost>(async ({ ctx, input }) =>
    requireMutation(
      (
        await ctx.db
          .delete(postsInPost)
          .where(and(ownedBy(postsInPost, input, ctx.getSessionPayload.user.id), isNull(postsInPost.parentId)))
          .returning()
      )[0],
      Operation.Delete,
      DatabaseEntityType.Post,
      input,
    ),
  ),
  readPost: standardRateLimitedProcedure
    .input(readPostInputSchema)
    // The procedure is rate-limited, so a session may be absent — no viewer means no like lookup at all
    .query<PostInPostWithRelations>(({ ctx, input }) =>
      readPostWithRelations(ctx.db, input, DatabaseEntityType.Post, ctx.getSessionPayload?.user.id),
    ),
  // The counts the server keeps on each post, read in one statement for the posts a client has marked as changed. The
  // Server adjusts a count in the same batch as the write that changes it, so only this read says what it is now
  readPostCounts: standardRateLimitedProcedure
    .input(readPostCountsInputSchema)
    .query<Pick<PostInPost, "commentCount" | "id" | "likeCount">[]>(({ ctx, input }) =>
      ctx.db
        .select({ commentCount: postsInPost.commentCount, id: postsInPost.id, likeCount: postsInPost.likeCount })
        .from(postsInPost)
        .where(inJsonArray(postsInPost.id, input)),
    ),
  readPosts: standardRateLimitedProcedure
    .input(readPostsInputSchema)
    .query<CursorPaginationData<PostInPostWithRelations>>(
      async ({ ctx, input: { cursor, limit, parentId, sortBy, userId: authorId } }) => {
        const userId = ctx.getSessionPayload?.user.id;
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
      },
    ),
  updateComment: getProfanityFilterProcedure(updateCommentInputSchema, [
    "description",
  ]).mutation<PostInPostWithRelations>(async ({ ctx, input: { id, ...rest } }) => {
    const updatedComment = requireMutation(
      (
        await ctx.db
          .update(postsInPost)
          .set(rest)
          .where(and(ownedBy(postsInPost, id, ctx.getSessionPayload.user.id), isNotNull(postsInPost.parentId)))
          .returning({ id: postsInPost.id })
      )[0],
      Operation.Update,
      DerivedDatabaseEntityType.Comment,
      id,
    );

    return readPostWithRelations(
      ctx.db,
      updatedComment.id,
      DerivedDatabaseEntityType.Comment,
      ctx.getSessionPayload.user.id,
    );
  }),
  updatePost: getProfanityFilterProcedure(updatePostInputSchema, [
    "title",
    "description",
  ]).mutation<PostInPostWithRelations>(async ({ ctx, input: { id, ...rest } }) => {
    const updatedPost = requireMutation(
      (
        await ctx.db
          .update(postsInPost)
          .set(rest)
          .where(and(ownedBy(postsInPost, id, ctx.getSessionPayload.user.id), isNull(postsInPost.parentId)))
          .returning({ id: postsInPost.id })
      )[0],
      Operation.Update,
      DatabaseEntityType.Post,
      id,
    );

    return readPostWithRelations(ctx.db, updatedPost.id, DatabaseEntityType.Post, ctx.getSessionPayload.user.id);
  }),
});
