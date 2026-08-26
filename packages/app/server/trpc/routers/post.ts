import type { CreatedComment } from "#shared/models/db/post/CreatedComment";
import type { DeletedComment } from "#shared/models/db/post/DeletedComment";
import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import type { Post, PostWithRelations, relations } from "@esposter/db-schema";
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
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
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
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { and, arrayContains, count, eq, inArray, isNotNull, isNull, sql } from "drizzle-orm";
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
        // The parent's chain plus the parent itself, which is the whole of what this reply inherits — and the
        // Exact set of posts whose counters it moves
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

        // Every ancestor, not just the parent: once replies nest, a counter that only counts direct children
        // Makes a feed card under-report its own thread — thirty comments showing as three
        await tx
          .update(posts)
          .set({ noComments: sql`${posts.noComments} + 1` })
          .where(inArray(posts.id, ancestorIds));

        return {
          ancestorIds,
          comment: getPostWithViewerLike(
            await requireEntity(
              tx.query.posts.findFirst({
                where: {
                  id: {
                    eq: newComment.id,
                  },
                },
                with: getViewerPostRelations(ctx.getSessionPayload.user.id),
              }),
              DerivedDatabaseEntityType.Comment,
              newComment.id,
            ),
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

        return getPostWithViewerLike(
          await requireEntity(
            tx.query.posts.findFirst({
              where: {
                id: {
                  eq: newPost.id,
                },
              },
              with: getViewerPostRelations(ctx.getSessionPayload.user.id),
            }),
            DatabaseEntityType.Post,
            newPost.id,
          ),
        );
      }),
  ),
  deleteComment: standardAuthedProcedure.input(deleteCommentInputSchema).mutation<DeletedComment>(({ ctx, input }) =>
    ctx.db.transaction(async (tx) => {
      // Counted before the delete, because the cascade takes the descendants with it and nothing afterwards
      // Could say how many rows left. Containment reads the whole subtree in one predicate — the chain is on
      // Every row, so nothing has to be walked to find out what is under this one
      const noDescendants = takeOne(
        await tx
          .select({ count: count() })
          .from(posts)
          .where(arrayContains(posts.ancestorIds, [input])),
      ).count;
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
      if (!deletedComment.parentId)
        throw getInvalidOperationError(Operation.Delete, DerivedDatabaseEntityType.Comment, input);

      // `parentId` cascades, so the replies beneath this one are already gone and the count read before the
      // Delete is the only record of how many that was. Every ancestor loses all of them, and the row that was
      // Deleted carries the list of which
      const { ancestorIds } = deletedComment;
      const noRemovedComments = noDescendants + 1;
      await tx
        .update(posts)
        .set({ noComments: sql`${posts.noComments} - ${noRemovedComments}` })
        .where(inArray(posts.id, ancestorIds));
      return { ancestorIds, noRemovedComments };
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
  readPost: standardRateLimitedProcedure.input(readPostInputSchema).query<PostWithRelations>(async ({ ctx, input }) => {
    // The procedure is rate-limited, so a session may be absent — no viewer means no like lookup at all
    const userId = ctx.getSessionPayload?.user.id;
    if (!userId)
      return getPostWithViewerLike(
        await requireEntity(
          ctx.db.query.posts.findFirst({
            where: {
              id: {
                eq: input,
              },
            },
            with: PostRelations,
          }),
          DatabaseEntityType.Post,
          input,
        ),
      );

    return getPostWithViewerLike(
      await requireEntity(
        ctx.db.query.posts.findFirst({
          where: {
            id: {
              eq: input,
            },
          },
          with: getViewerPostRelations(userId),
        }),
        DatabaseEntityType.Post,
        input,
      ),
    );
  }),
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
        const resultPosts = userId
          ? await ctx.db.query.posts.findMany({
              limit: limit + 1,
              orderBy: (post) => parseSortByToSql(post, sortBy),
              where,
              with: getViewerPostRelations(userId),
            })
          : await ctx.db.query.posts.findMany({
              limit: limit + 1,
              orderBy: (post) => parseSortByToSql(post, sortBy),
              where,
              with: PostRelations,
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

        return getPostWithViewerLike(
          await requireEntity(
            tx.query.posts.findFirst({
              where: {
                id: {
                  eq: updatedComment.id,
                },
                parentId: {
                  isNotNull: true,
                },
                userId: {
                  eq: ctx.getSessionPayload.user.id,
                },
              },
              with: getViewerPostRelations(ctx.getSessionPayload.user.id),
            }),
            DerivedDatabaseEntityType.Comment,
            id,
          ),
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

        return getPostWithViewerLike(
          await requireEntity(
            tx.query.posts.findFirst({
              where: {
                id: {
                  eq: updatedPost.id,
                },
                parentId: {
                  isNull: true,
                },
                userId: {
                  eq: ctx.getSessionPayload.user.id,
                },
              },
              with: getViewerPostRelations(ctx.getSessionPayload.user.id),
            }),
            DatabaseEntityType.Post,
            id,
          ),
        );
      }),
  ),
});
