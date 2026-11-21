import type { CreatedComment } from "#shared/models/db/post/CreatedComment";
import type { DeletedComment } from "#shared/models/db/post/DeletedComment";
import type { Page, PostInPost, PostInPostWithRelations, relations } from "@esposter/db-schema";
import type { RelationsFilter } from "drizzle-orm";

import { getInsertSelectMetadata } from "#server/services/db/getInsertSelectMetadata";
import { ownedBy } from "#server/services/db/ownedBy";
import { bindPostSort } from "#server/services/post/bindPostSort";
import { getNotBlockedWhere } from "#server/services/post/getNotBlockedWhere";
import { getPostSubtreeWhere } from "#server/services/post/getPostSubtreeWhere";
import { getPostWithViewerLike } from "#server/services/post/getPostWithViewerLike";
import { getViewerPostRelations } from "#server/services/post/getViewerPostRelations";
import { readPostWithRelations } from "#server/services/post/readPostWithRelations";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { router } from "#server/trpc/index";
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
import { getPageOrderBy, getPageWhere, inJsonArray, toPage } from "@esposter/db";
import {
  DatabaseEntityType,
  DerivedDatabaseEntityType,
  getLiveRowWhere,
  PostInPostRelations,
  postsInPost,
} from "@esposter/db-schema";
import { getPostRanking, Operation } from "@esposter/shared";
import { and, eq, isNotNull, isNull, sql } from "drizzle-orm";

export const postRouter = router({
  createComment: getProfanityFilterProcedure(createCommentInputSchema, ["description"]).mutation<CreatedComment>(
    async ({ ctx, input }) => {
      const parentPost = await requireEntity(
        ctx.db.query.postsInPost.findFirst({
          columns: { ancestorIds: true, depth: true, id: true },
          where: { id: { eq: input.parentId }, RAW: getLiveRowWhere },
        }),
        DatabaseEntityType.Post,
        input.parentId,
      );
      // The parent's chain plus the parent itself: what this reply inherits, and the posts whose counters move
      const ancestorIds = [...parentPost.ancestorIds, parentPost.id];
      const createdAt = new Date();
      // The parent is live in the write as well as in the read above, since a removal can land between the two. The reply
      // And the counters take that as their guard, so a reply to a removed post is never written and counts nowhere
      const isParentLive = and(eq(postsInPost.id, input.parentId), getLiveRowWhere(postsInPost));
      // The reply and the counter of every ancestor commit in one batch, so no counter counts a reply that did not land
      const [newCommentRows] = await ctx.db.batch([
        ctx.db
          .insert(postsInPost)
          .select(
            ctx.db
              .select({
                ...getInsertSelectMetadata(postsInPost),
                ancestorIds: sql`${sql.param(ancestorIds, postsInPost.ancestorIds)}`.as("ancestorIds"),
                depth: sql<number>`${parentPost.depth + 1}`.as("depth"),
                description: sql<string>`${input.description}`.as("description"),
                id: sql<string>`${input.id}`.as("id"),
                parentId: sql<string>`${input.parentId}`.as("parentId"),
                ranking: sql<number>`${getPostRanking(0, createdAt)}`.as("ranking"),
                userId: sql<string>`${ctx.user.id}`.as("userId"),
              })
              .from(postsInPost)
              .where(isParentLive),
          )
          .returning(),
        // Every ancestor, not just the parent: a counter that stops at direct children makes a feed card
        // Under-report its own thread
        ctx.db
          .update(postsInPost)
          .set({ commentCount: sql`${postsInPost.commentCount} + 1` })
          .where(
            and(
              inJsonArray(postsInPost.id, ancestorIds),
              sql`exists (select 1 from ${postsInPost} where ${isParentLive})`,
            ),
          ),
      ]);
      // No row back means the guard lost: the parent was removed after the read, so the reply is refused as the post it now is
      const newComment = newCommentRows[0];
      if (!newComment) throw getNotFoundError(DatabaseEntityType.Post, input.parentId);

      return {
        ancestorIds,
        comment: await readPostWithRelations(ctx.db, newComment.id, DerivedDatabaseEntityType.Comment, ctx.user.id),
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
          .values({ ...input, createdAt, ranking: getPostRanking(0, createdAt), userId: ctx.user.id })
          .returning()
      )[0],
      Operation.Create,
      DatabaseEntityType.Post,
      JSON.stringify(input),
    );

    return readPostWithRelations(ctx.db, newPost.id, DatabaseEntityType.Post, ctx.user.id);
  }),
  deleteComment: standardAuthedProcedure
    .input(deleteCommentInputSchema)
    .mutation<DeletedComment>(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const ownedComment = and(
        ownedBy(postsInPost, input, userId),
        isNotNull(postsInPost.parentId),
        getLiveRowWhere(postsInPost),
      );
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
      // The live subtree is the comment and every live reply beneath it. It is read inside the batch rather than before it:
      // A reply landing between a read and the removal would otherwise be subtracted from the ancestors without being named.
      // The counter's own subquery and the removal see the same rows, since nothing else writes between them
      const subtreeWhere = and(getPostSubtreeWhere(input, threadRootId), getLiveRowWhere(postsInPost));
      const [, removedRows] = await ctx.db.batch([
        // Every ancestor loses the live subtree; the guard leaves the counters alone when the removal below will not land
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
        // The subtree is tombstoned rather than deleted: each row keeps its place and takes the version the removal raises, so a
        // Read that answered before it cannot bring a reply back. The text is cleared, so no reader is handed the removed words
        ctx.db
          .update(postsInPost)
          .set({ deletedAt: new Date(), description: "", title: "" })
          .where(and(subtreeWhere, sql`exists (select 1 from ${postsInPost} where ${ownedComment})`))
          .returning(),
      ]);
      requireMutation(removedRows[0], Operation.Delete, DerivedDatabaseEntityType.Comment, input);
      return { ancestorIds, removed: removedRows };
    }),
  deletePost: standardAuthedProcedure.input(deletePostInputSchema).mutation<PostInPost[]>(async ({ ctx, input }) => {
    const ownedPost = and(
      ownedBy(postsInPost, input, ctx.user.id),
      isNull(postsInPost.parentId),
      getLiveRowWhere(postsInPost),
    );
    // The live thread under the post is tombstoned in the one statement, and it is the owner's post that gates it, so a
    // Reply landing meanwhile is either named in the answer or never written
    const removedRows = await ctx.db
      .update(postsInPost)
      .set({ deletedAt: new Date(), description: "", title: "" })
      .where(
        and(
          getPostSubtreeWhere(input, input),
          getLiveRowWhere(postsInPost),
          sql`exists (select 1 from ${postsInPost} where ${ownedPost})`,
        ),
      )
      .returning();
    requireMutation(removedRows[0], Operation.Delete, DatabaseEntityType.Post, input);
    return removedRows;
  }),
  // The procedure is rate-limited, so a session may be absent — no viewer means no like lookup at all
  readPost: standardRateLimitedProcedure
    .input(readPostInputSchema)
    .query<PostInPostWithRelations>(({ ctx, input }) =>
      readPostWithRelations(ctx.db, input, DatabaseEntityType.Post, ctx.user?.id),
    ),
  // The counts the server keeps on each post, read in one statement for the posts a client has marked as changed. The
  // Server adjusts a count in the same batch as the write that changes it, so only this read says what it is now. Each
  // Count names the post's version, since a count moves with the row that holds it, so a client orders the two by it
  readPostCounts: standardRateLimitedProcedure
    .input(readPostCountsInputSchema)
    .query<Pick<PostInPost, "commentCount" | "id" | "likeCount" | "version">[]>(({ ctx, input }) =>
      ctx.db
        .select({
          commentCount: postsInPost.commentCount,
          id: postsInPost.id,
          likeCount: postsInPost.likeCount,
          version: postsInPost.version,
        })
        .from(postsInPost)
        .where(inJsonArray(postsInPost.id, input)),
    ),
  readPosts: standardRateLimitedProcedure
    .input(readPostsInputSchema)
    .query<Page<PostInPostWithRelations>>(
      async ({ ctx, input: { cursor, limit, parentId, sort, userId: authorId } }) => {
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
          .where(
            and(ownedBy(postsInPost, id, ctx.user.id), isNotNull(postsInPost.parentId), getLiveRowWhere(postsInPost)),
          )
          .returning()
      )[0],
      Operation.Update,
      DerivedDatabaseEntityType.Comment,
      id,
    );

    return readPostWithRelations(ctx.db, updatedComment.id, DerivedDatabaseEntityType.Comment, ctx.user.id);
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
          .where(and(ownedBy(postsInPost, id, ctx.user.id), isNull(postsInPost.parentId), getLiveRowWhere(postsInPost)))
          .returning()
      )[0],
      Operation.Update,
      DatabaseEntityType.Post,
      id,
    );

    return readPostWithRelations(ctx.db, updatedPost.id, DatabaseEntityType.Post, ctx.user.id);
  }),
});
