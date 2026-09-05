import type { CreatedComment } from "#shared/models/db/post/CreatedComment";
import type { DeletedComment } from "#shared/models/db/post/DeletedComment";
import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import type { Transaction } from "@@/server/models/db/Transaction";
import type { Context } from "@@/server/trpc/context";
import type { Post, PostWithRelations, relations, User } from "@esposter/db-schema";
import type { RelationsFilter } from "drizzle-orm";

import { createCommentInputSchema } from "#shared/models/db/post/CreateCommentInput";
import { createPostInputSchema } from "#shared/models/db/post/CreatePostInput";
import { deleteCommentInputSchema } from "#shared/models/db/post/DeleteCommentInput";
import { deletePostInputSchema } from "#shared/models/db/post/DeletePostInput";
import { updateCommentInputSchema } from "#shared/models/db/post/UpdateCommentInput";
import { updatePostInputSchema } from "#shared/models/db/post/UpdatePostInput";
import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { ownedBy } from "@@/server/services/db/ownedBy";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "@@/server/services/pagination/cursor/getCursorWhere";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { getNotBlockedWhere } from "@@/server/services/post/getNotBlockedWhere";
import { getPostRanking } from "@@/server/services/post/getPostRanking";
import { getPostWithViewerLike } from "@@/server/services/post/getPostWithViewerLike";
import { getViewerPostRelations } from "@@/server/services/post/getViewerPostRelations";
import { router } from "@@/server/trpc";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { getProfanityFilterProcedure } from "@@/server/trpc/procedure/getProfanityFilterProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { standardRateLimitedProcedure } from "@@/server/trpc/procedure/standardRateLimitedProcedure";
import {
  DatabaseEntityType,
  DerivedDatabaseEntityType,
  PostRelations,
  posts,
  selectPostSchema,
} from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { and, arrayContains, eq, inArray, isNotNull, isNull, or, sql } from "drizzle-orm";
import { z } from "zod";

const readPostInputSchema = selectPostSchema.shape.id;

const readPostsInputSchema = z
  .object({
    ...createCursorPaginationParamsSchema(selectPostSchema.keyof(), [
      { key: "ranking", order: SortOrder.Desc },
      { key: "id", order: SortOrder.Desc },
    ]).shape,
    [selectPostSchema.keyof().enum.parentId]: selectPostSchema.shape.parentId.default(null),
    [selectPostSchema.keyof().enum.userId]: selectPostSchema.shape.userId.optional(),
  })
  .prefault({});

// The row a card renders: the author beside it, and the viewer's own like when there is a viewer to have one.
// Signed out there is no like to look up, so the read drops the filtered relation rather than filtering on nobody
const readPostWithRelations = async (
  db: Context["db"] | Transaction,
  id: Post["id"],
  entityType: string,
  userId?: User["id"],
): Promise<PostWithRelations> =>
  getPostWithViewerLike(
    await requireEntity(
      db.query.posts.findFirst({
        where: {
          id: {
            eq: id,
          },
        },
        with: userId ? getViewerPostRelations(userId) : PostRelations,
      }),
      entityType,
      id,
    ),
  );

export const postRouter = router({
  createComment: getProfanityFilterProcedure(createCommentInputSchema, ["description"]).mutation<CreatedComment>(
    ({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        const parentPost = await requireEntity(
          tx.query.posts.findFirst({
            columns: {
              ancestorIds: true,
              depth: true,
              id: true,
            },
            where: {
              id: {
                eq: input.parentId,
              },
            },
          }),
          DatabaseEntityType.Post,
          input.parentId,
        );
        // The parent's chain plus the parent itself: what this reply inherits, and the posts whose counters move
        const ancestorIds = [...parentPost.ancestorIds, parentPost.id];
        const createdAt = new Date();
        const newComment = requireMutation(
          (
            await tx
              .insert(posts)
              .values({
                ...input,
                ancestorIds,
                createdAt,
                depth: parentPost.depth + 1,
                ranking: getPostRanking(0, createdAt),
                userId: ctx.getSessionPayload.user.id,
              })
              .returning({ id: posts.id })
          )[0],
          Operation.Create,
          DerivedDatabaseEntityType.Comment,
          JSON.stringify(input),
        );
        // Every ancestor, not just the parent: a counter that stops at direct children makes a feed card
        // Under-report its own thread
        await tx
          .update(posts)
          .set({ commentCount: sql`${posts.commentCount} + 1` })
          .where(inArray(posts.id, ancestorIds));

        return {
          ancestorIds,
          comment: await readPostWithRelations(
            tx,
            newComment.id,
            DerivedDatabaseEntityType.Comment,
            ctx.getSessionPayload.user.id,
          ),
        };
      }),
  ),
  createPost: getProfanityFilterProcedure(createPostInputSchema, ["title", "description"]).mutation<PostWithRelations>(
    ({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        const createdAt = new Date();
        const newPost = requireMutation(
          (
            await tx
              .insert(posts)
              .values({
                ...input,
                createdAt,
                ranking: getPostRanking(0, createdAt),
                userId: ctx.getSessionPayload.user.id,
              })
              .returning({ id: posts.id })
          )[0],
          Operation.Create,
          DatabaseEntityType.Post,
          JSON.stringify(input),
        );

        return readPostWithRelations(tx, newPost.id, DatabaseEntityType.Post, ctx.getSessionPayload.user.id);
      }),
  ),
  deleteComment: standardAuthedProcedure.input(deleteCommentInputSchema).mutation<DeletedComment>(({ ctx, input }) =>
    ctx.db.transaction(async (tx) => {
      // Counted before the delete, because the cascade takes these rows with it and nothing afterwards could say
      // How many there were. Containment reads the whole subtree in one predicate, this row included, which makes
      // The count the number every ancestor loses.
      // The rows are locked rather than merely counted: a delete of a reply beneath this one would otherwise commit
      // Between this read and the decrement below, and both writes would subtract that same reply from every
      // Ancestor above it. Ascending id is the order every such delete acquires them in, so an overlap waits here —
      // And one that still collides further in is aborted by the deadlock detector rather than double-counted
      const removedComments = await tx
        .select({ id: posts.id })
        .from(posts)
        .where(or(eq(posts.id, input), arrayContains(posts.ancestorIds, [input])))
        .orderBy(posts.id)
        .for("update");
      const removedCommentCount = removedComments.length;
      const deletedComment = requireMutation(
        (
          await tx
            .delete(posts)
            .where(and(ownedBy(posts, input, ctx.getSessionPayload.user.id), isNotNull(posts.parentId)))
            .returning()
        )[0],
        Operation.Delete,
        DerivedDatabaseEntityType.Comment,
        input,
      );
      // Every ancestor loses the whole subtree, and the deleted row carries the list of which posts those are
      const { ancestorIds } = deletedComment;
      await tx
        .update(posts)
        .set({ commentCount: sql`${posts.commentCount} - ${removedCommentCount}` })
        .where(inArray(posts.id, ancestorIds));
      return { ancestorIds, removedCommentCount };
    }),
  ),
  deletePost: standardAuthedProcedure.input(deletePostInputSchema).mutation<Post>(async ({ ctx, input }) => {
    const deletedPost = requireMutation(
      (
        await ctx.db
          .delete(posts)
          .where(and(ownedBy(posts, input, ctx.getSessionPayload.user.id), isNull(posts.parentId)))
          .returning()
      )[0],
      Operation.Delete,
      DatabaseEntityType.Post,
      input,
    );
    return deletedPost;
  }),
  readPost: standardRateLimitedProcedure
    .input(readPostInputSchema)
    // The procedure is rate-limited, so a session may be absent — no viewer means no like lookup at all
    .query<PostWithRelations>(({ ctx, input }) =>
      readPostWithRelations(ctx.db, input, DatabaseEntityType.Post, ctx.getSessionPayload?.user.id),
    ),
  readPosts: standardRateLimitedProcedure
    .input(readPostsInputSchema)
    .query<CursorPaginationData<PostWithRelations>>(
      async ({ ctx, input: { cursor, limit, parentId, sortBy, userId: authorId } }) => {
        const userId = ctx.getSessionPayload?.user.id;
        const where: RelationsFilter<(typeof relations)["posts"], typeof relations> = parentId
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
              throw new InvalidOperationError(Operation.Read, DatabaseEntityType.Post, JSON.stringify({ cursor }));
            return rawWhere;
          };
        const resultPosts = await ctx.db.query.posts.findMany({
          limit: limit + 1,
          orderBy: (post) => parseSortByToSql(post, sortBy),
          where,
          with: userId ? getViewerPostRelations(userId) : PostRelations,
        });
        return getCursorPaginationData(
          resultPosts.map((post) => getPostWithViewerLike(post)),
          limit,
          sortBy,
        );
      },
    ),
  updateComment: getProfanityFilterProcedure(updateCommentInputSchema, ["description"]).mutation<PostWithRelations>(
    ({ ctx, input: { id, ...rest } }) =>
      ctx.db.transaction(async (tx) => {
        const updatedComment = requireMutation(
          (
            await tx
              .update(posts)
              .set(rest)
              .where(and(ownedBy(posts, id, ctx.getSessionPayload.user.id), isNotNull(posts.parentId)))
              .returning({ id: posts.id })
          )[0],
          Operation.Update,
          DerivedDatabaseEntityType.Comment,
          id,
        );

        return readPostWithRelations(
          tx,
          updatedComment.id,
          DerivedDatabaseEntityType.Comment,
          ctx.getSessionPayload.user.id,
        );
      }),
  ),
  updatePost: getProfanityFilterProcedure(updatePostInputSchema, ["title", "description"]).mutation<PostWithRelations>(
    ({ ctx, input: { id, ...rest } }) =>
      ctx.db.transaction(async (tx) => {
        const updatedPost = requireMutation(
          (
            await tx
              .update(posts)
              .set(rest)
              .where(and(ownedBy(posts, id, ctx.getSessionPayload.user.id), isNull(posts.parentId)))
              .returning({ id: posts.id })
          )[0],
          Operation.Update,
          DatabaseEntityType.Post,
          id,
        );

        return readPostWithRelations(tx, updatedPost.id, DatabaseEntityType.Post, ctx.getSessionPayload.user.id);
      }),
  ),
});
