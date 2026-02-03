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
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { z } from "zod";

const readPostInputSchema = selectPostSchema.shape.id;
export type ReadPostInput = z.infer<typeof readPostInputSchema>;

const readPostsInputSchema = z
  .object({
    ...createCursorPaginationParamsSchema(selectPostSchema.keyof(), [{ key: "ranking", order: SortOrder.Desc }]).shape,
    [selectPostSchema.keyof().enum.parentId]: selectPostSchema.shape.parentId.default(null),
  })
  .prefault({});
export type ReadPostsInput = z.infer<typeof readPostsInputSchema>;

export const postRouter = router({
  createComment: getProfanityFilterProcedure(createCommentInputSchema, ["description"]).mutation<PostWithRelations>(
    ({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        const parentPost = await tx.query.posts.findFirst({
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
        });
        if (!parentPost)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: new NotFoundError(DatabaseEntityType.Post, input.parentId).message,
          });

        const createdAt = new Date();
        const newComment = (
          await tx
            .insert(posts)
            .values({
              ...input,
              createdAt,
              depth: parentPost.depth + 1,
              ranking: ranking(0, createdAt),
              userId: ctx.session.user.id,
            })
            .returning({ id: posts.id })
        )[0];
        if (!newComment)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: new InvalidOperationError(
              Operation.Create,
              DerivedDatabaseEntityType.Comment,
              JSON.stringify(input),
            ).message,
          });

        await tx
          .update(posts)
          .set({ noComments: parentPost.noComments + 1 })
          .where(eq(posts.id, parentPost.id));

        const newCommentWithRelations = await tx.query.posts.findFirst({
          where: {
            id: {
              eq: newComment.id,
            },
          },
          with: PostRelations,
        });
        if (!newCommentWithRelations)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: new NotFoundError(DerivedDatabaseEntityType.Comment, newComment.id).message,
          });
        return newCommentWithRelations;
      }),
  ),
  createPost: getProfanityFilterProcedure(createPostInputSchema, ["title", "description"]).mutation<PostWithRelations>(
    ({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        const createdAt = new Date();
        const newPost = (
          await tx
            .insert(posts)
            .values({
              ...input,
              createdAt,
              ranking: ranking(0, createdAt),
              userId: ctx.session.user.id,
            })
            .returning({ id: posts.id })
        )[0];
        if (!newPost)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Post, JSON.stringify(input))
              .message,
          });

        const newPostWithRelations = await tx.query.posts.findFirst({
          where: {
            id: {
              eq: newPost.id,
            },
          },
          with: PostRelations,
        });
        if (!newPostWithRelations)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: new NotFoundError(DatabaseEntityType.Post, newPost.id).message,
          });
        return newPostWithRelations;
      }),
  ),
  deleteComment: standardAuthedProcedure.input(deleteCommentInputSchema).mutation<Post>(({ ctx, input }) =>
    ctx.db.transaction(async (tx) => {
      const deletedComment = (
        await tx
          .delete(posts)
          .where(and(eq(posts.id, input), eq(posts.userId, ctx.session.user.id), isNotNull(posts.parentId)))
          .returning()
      )[0];
      const postId = deletedComment?.parentId;
      if (!postId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Delete, DerivedDatabaseEntityType.Comment, input).message,
        });

      const post = await tx.query.posts.findFirst({
        columns: {
          id: true,
          noComments: true,
        },
        where: {
          id: {
            eq: postId,
          },
        },
      });
      if (!post)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.Post, postId).message,
        });

      await tx
        .update(posts)
        .set({ noComments: post.noComments - 1 })
        .where(eq(posts.id, post.id));
      return deletedComment;
    }),
  ),
  deletePost: standardAuthedProcedure.input(deletePostInputSchema).mutation<Post>(async ({ ctx, input }) => {
    const deletedPost = (
      await ctx.db
        .delete(posts)
        .where(and(eq(posts.id, input), eq(posts.userId, ctx.session.user.id), isNull(posts.parentId)))
        .returning()
    )[0];
    if (!deletedPost)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(Operation.Delete, DatabaseEntityType.Post, input).message,
      });
    return deletedPost;
  }),
  readPost: standardRateLimitedProcedure.input(readPostInputSchema).query<PostWithRelations>(async ({ ctx, input }) => {
    const post = await ctx.db.query.posts.findFirst({
      where: {
        id: {
          eq: input,
        },
      },
      with: PostRelations,
    });
    if (!post)
      throw new TRPCError({ code: "NOT_FOUND", message: new NotFoundError(DatabaseEntityType.Post, input).message });
    return post;
  }),
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
        const updatedComment = (
          await tx
            .update(posts)
            .set(rest)
            .where(and(eq(posts.id, id), eq(posts.userId, ctx.session.user.id)))
            .returning({ id: posts.id })
        )[0];
        if (!updatedComment)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: new InvalidOperationError(Operation.Update, DerivedDatabaseEntityType.Comment, id).message,
          });

        const updatedCommentWithRelations = await tx.query.posts.findFirst({
          where: {
            id: {
              eq: updatedComment.id,
            },
            parentId: {
              isNotNull: true,
            },
            userId: {
              eq: ctx.session.user.id,
            },
          },
          with: PostRelations,
        });
        if (!updatedCommentWithRelations)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: new NotFoundError(DerivedDatabaseEntityType.Comment, id).message,
          });
        return updatedCommentWithRelations;
      }),
  ),
  updatePost: getProfanityFilterProcedure(updatePostInputSchema, ["title", "description"]).mutation<PostWithRelations>(
    ({ ctx, input: { id, ...rest } }) =>
      ctx.db.transaction(async (tx) => {
        const updatedPost = (
          await tx
            .update(posts)
            .set(rest)
            .where(and(eq(posts.id, id), isNull(posts.parentId), eq(posts.userId, ctx.session.user.id)))
            .returning({ id: posts.id })
        )[0];
        if (!updatedPost)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: new InvalidOperationError(Operation.Update, DatabaseEntityType.Post, id).message,
          });

        const updatedPostWithRelations = await tx.query.posts.findFirst({
          where: {
            id: {
              eq: updatedPost.id,
            },
            parentId: {
              isNull: true,
            },
            userId: {
              eq: ctx.session.user.id,
            },
          },
          with: PostRelations,
        });
        if (!updatedPostWithRelations)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: new NotFoundError(DatabaseEntityType.Post, id).message,
          });
        return updatedPostWithRelations;
      }),
  ),
});
