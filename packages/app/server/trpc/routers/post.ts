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
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "@@/server/services/pagination/cursor/getCursorWhere";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { ranking } from "@@/server/services/post/ranking";
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
import { TRPCError } from "@trpc/server";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { z } from "zod";

const readPostInputSchema = selectPostSchema.shape.id;

const readPostsInputSchema = z
  .object({
    ...createCursorPaginationParamsSchema(selectPostSchema.keyof(), [{ key: "ranking", order: SortOrder.Desc }]).shape,
    [selectPostSchema.keyof().enum.parentId]: selectPostSchema.shape.parentId.default(null),
  })
  .prefault({});

export const postRouter = router({
  createComment: getProfanityFilterProcedure(createCommentInputSchema, ["description"]).mutation<PostWithRelations>(
    ({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        const parentPost = await requireEntity(
          tx.query.posts.findFirst({
            columns: {
              depth: true,
              id: true,
              noComments: true,
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

        const createdAt = new Date();
        const newComment = requireMutation(
          (
            await tx
              .insert(posts)
              .values({
                ...input,
                createdAt,
                depth: parentPost.depth + 1,
                ranking: ranking(0, createdAt),
                userId: ctx.getSessionPayload.user.id,
              })
              .returning({ id: posts.id })
          )[0],
          Operation.Create,
          DerivedDatabaseEntityType.Comment,
          JSON.stringify(input),
        );

        await tx
          .update(posts)
          .set({ noComments: parentPost.noComments + 1 })
          .where(eq(posts.id, parentPost.id));

        return requireEntity(
          tx.query.posts.findFirst({
            where: {
              id: {
                eq: newComment.id,
              },
            },
            with: PostRelations,
          }),
          DerivedDatabaseEntityType.Comment,
          newComment.id,
        );
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
                ranking: ranking(0, createdAt),
                userId: ctx.getSessionPayload.user.id,
              })
              .returning({ id: posts.id })
          )[0],
          Operation.Create,
          DatabaseEntityType.Post,
          JSON.stringify(input),
        );

        return requireEntity(
          tx.query.posts.findFirst({
            where: {
              id: {
                eq: newPost.id,
              },
            },
            with: PostRelations,
          }),
          DatabaseEntityType.Post,
          newPost.id,
        );
      }),
  ),
  deleteComment: standardAuthedProcedure.input(deleteCommentInputSchema).mutation<Post>(({ ctx, input }) =>
    ctx.db.transaction(async (tx) => {
      const deletedComment = requireMutation(
        (
          await tx
            .delete(posts)
            .where(and(eq(posts.id, input), eq(posts.userId, ctx.getSessionPayload.user.id), isNotNull(posts.parentId)))
            .returning()
        )[0],
        Operation.Delete,
        DerivedDatabaseEntityType.Comment,
        input,
      );
      const { parentId: postId } = deletedComment;
      if (!postId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Delete, DerivedDatabaseEntityType.Comment, input).message,
        });

      const post = await requireEntity(
        tx.query.posts.findFirst({
          columns: {
            id: true,
            noComments: true,
          },
          where: {
            id: {
              eq: postId,
            },
          },
        }),
        DatabaseEntityType.Post,
        postId,
      );

      await tx
        .update(posts)
        .set({ noComments: post.noComments - 1 })
        .where(eq(posts.id, post.id));
      return deletedComment;
    }),
  ),
  deletePost: standardAuthedProcedure.input(deletePostInputSchema).mutation<Post>(async ({ ctx, input }) => {
    const deletedPost = requireMutation(
      (
        await ctx.db
          .delete(posts)
          .where(and(eq(posts.id, input), eq(posts.userId, ctx.getSessionPayload.user.id), isNull(posts.parentId)))
          .returning()
      )[0],
      Operation.Delete,
      DatabaseEntityType.Post,
      input,
    );
    return deletedPost;
  }),
  readPost: standardRateLimitedProcedure.input(readPostInputSchema).query<PostWithRelations>(({ ctx, input }) =>
    requireEntity(
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
  ),
  readPosts: standardRateLimitedProcedure
    .input(readPostsInputSchema)
    .query(async ({ ctx, input: { cursor, limit, parentId, sortBy } }) => {
      const where: RelationsFilter<(typeof relations)["posts"], typeof relations> = parentId
        ? { parentId: { eq: parentId } }
        : { parentId: { isNull: true } };
      if (cursor) where.RAW = (posts) => getCursorWhere(posts, cursor, sortBy);
      const resultPosts: PostWithRelations[] = await ctx.db.query.posts.findMany({
        limit: limit + 1,
        orderBy: (posts) => parseSortByToSql(posts, sortBy),
        where,
        with: PostRelations,
      });
      return getCursorPaginationData(resultPosts, limit, sortBy);
    }),
  updateComment: getProfanityFilterProcedure(updateCommentInputSchema, ["description"]).mutation<PostWithRelations>(
    ({ ctx, input: { id, ...rest } }) =>
      ctx.db.transaction(async (tx) => {
        const updatedComment = requireMutation(
          (
            await tx
              .update(posts)
              .set(rest)
              .where(and(eq(posts.id, id), isNotNull(posts.parentId), eq(posts.userId, ctx.getSessionPayload.user.id)))
              .returning({ id: posts.id })
          )[0],
          Operation.Update,
          DerivedDatabaseEntityType.Comment,
          id,
        );

        return requireEntity(
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
            with: PostRelations,
          }),
          DerivedDatabaseEntityType.Comment,
          id,
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
              .where(and(eq(posts.id, id), isNull(posts.parentId), eq(posts.userId, ctx.getSessionPayload.user.id)))
              .returning({ id: posts.id })
          )[0],
          Operation.Update,
          DatabaseEntityType.Post,
          id,
        );

        return requireEntity(
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
            with: PostRelations,
          }),
          DatabaseEntityType.Post,
          id,
        );
      }),
  ),
});
