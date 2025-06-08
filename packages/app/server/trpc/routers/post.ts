import type { Post, PostWithRelations } from "#shared/db/schema/posts";

import { PostRelations, posts, selectPostSchema } from "#shared/db/schema/posts";
import { createCommentInputSchema } from "#shared/models/db/post/CreateCommentInput";
import { createPostInputSchema } from "#shared/models/db/post/CreatePostInput";
import { deleteCommentInputSchema } from "#shared/models/db/post/DeleteCommentInput";
import { deletePostInputSchema } from "#shared/models/db/post/DeletePostInput";
import { updateCommentInputSchema } from "#shared/models/db/post/UpdateCommentInput";
import { updatePostInputSchema } from "#shared/models/db/post/UpdatePostInput";
import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { DerivedDatabaseEntityType } from "#shared/models/entity/DerivedDatabaseEntityType";
import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "@@/server/services/pagination/cursor/getCursorWhere";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { ranking } from "@@/server/services/post/ranking";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { getProfanityFilterProcedure } from "@@/server/trpc/procedure/getProfanityFilterProcedure";
import { rateLimitedProcedure } from "@@/server/trpc/procedure/rateLimitedProcedure";
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { z } from "zod/v4";

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
  createComment: getProfanityFilterProcedure(createCommentInputSchema, ["description"])
    .input(createCommentInputSchema)
    .mutation<PostWithRelations>(async ({ ctx, input }) => {
      const parentPost = await ctx.db.query.posts.findFirst({ where: (posts, { eq }) => eq(posts.id, input.parentId) });
      if (!parentPost)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.Post, input.parentId).message,
        });

      const newComment = await ctx.db.transaction(async (tx) => {
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
        ).find(Boolean);
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
        return newComment;
      });

      const newCommentWithRelations = await ctx.db.query.posts.findFirst({
        where: (posts, { eq }) => eq(posts.id, newComment.id),
        with: PostRelations,
      });
      if (!newCommentWithRelations)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DerivedDatabaseEntityType.Comment, newComment.id).message,
        });
      return newCommentWithRelations;
    }),
  createPost: getProfanityFilterProcedure(createPostInputSchema, ["title", "description"])
    .input(createPostInputSchema)
    .mutation<PostWithRelations>(async ({ ctx, input }) => {
      const createdAt = new Date();
      const newPost = (
        await ctx.db
          .insert(posts)
          .values({
            ...input,
            createdAt,
            ranking: ranking(0, createdAt),
            userId: ctx.session.user.id,
          })
          .returning({ id: posts.id })
      ).find(Boolean);
      if (!newPost)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Post, JSON.stringify(input)).message,
        });

      const newPostWithRelations = await ctx.db.query.posts.findFirst({
        where: (posts, { eq }) => eq(posts.id, newPost.id),
        with: PostRelations,
      });
      if (!newPostWithRelations)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.Post, newPost.id).message,
        });
      return newPostWithRelations;
    }),
  deleteComment: authedProcedure.input(deleteCommentInputSchema).mutation<Post>(async ({ ctx, input }) =>
    ctx.db.transaction(async (tx) => {
      const deletedComment = (
        await tx
          .delete(posts)
          .where(and(eq(posts.id, input), eq(posts.userId, ctx.session.user.id), isNotNull(posts.parentId)))
          .returning()
      ).find(Boolean);
      const postId = deletedComment?.parentId;
      if (!postId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Delete, DerivedDatabaseEntityType.Comment, input).message,
        });

      const post = await tx.query.posts.findFirst({ where: (posts, { eq }) => eq(posts.id, postId) });
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
  deletePost: authedProcedure.input(deletePostInputSchema).mutation<Post>(async ({ ctx, input }) =>
    ctx.db.transaction(async (tx) => {
      const deletedPost = (
        await tx
          .delete(posts)
          .where(and(eq(posts.id, input), eq(posts.userId, ctx.session.user.id), isNull(posts.parentId)))
          .returning()
      ).find(Boolean);
      if (!deletedPost)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Delete, DatabaseEntityType.Post, input).message,
        });
      // Delete comments
      await tx.delete(posts).where(eq(posts.parentId, deletedPost.id));
      return deletedPost;
    }),
  ),
  readPost: rateLimitedProcedure.input(readPostInputSchema).query<PostWithRelations>(async ({ ctx, input }) => {
    const post = await ctx.db.query.posts.findFirst({
      where: (posts, { eq }) => eq(posts.id, input),
      with: PostRelations,
    });
    if (!post)
      throw new TRPCError({ code: "NOT_FOUND", message: new NotFoundError(DatabaseEntityType.Post, input).message });
    return post;
  }),
  readPosts: rateLimitedProcedure
    .input(readPostsInputSchema)
    .query(async ({ ctx, input: { cursor, limit, parentId, sortBy } }) => {
      const parentIdWhere = parentId ? eq(posts.parentId, parentId) : isNull(posts.parentId);
      const cursorWhere = cursor ? getCursorWhere(posts, cursor, sortBy) : undefined;
      const where = cursorWhere ? and(parentIdWhere, cursorWhere) : parentIdWhere;
      const resultPosts: PostWithRelations[] = await ctx.db.query.posts.findMany({
        limit: limit + 1,
        orderBy: parseSortByToSql(posts, sortBy),
        where,
        with: PostRelations,
      });
      return getCursorPaginationData(resultPosts, limit, sortBy);
    }),
  updateComment: getProfanityFilterProcedure(updateCommentInputSchema, ["description"])
    .input(updateCommentInputSchema)
    .mutation<PostWithRelations>(async ({ ctx, input: { id, ...rest } }) => {
      const updatedComment = (
        await ctx.db
          .update(posts)
          .set(rest)
          .where(and(eq(posts.id, id), eq(posts.userId, ctx.session.user.id)))
          .returning({ id: posts.id })
      ).find(Boolean);
      if (!updatedComment)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Update, DerivedDatabaseEntityType.Comment, id).message,
        });

      const updatedCommentWithRelations = await ctx.db.query.posts.findFirst({
        where: (posts, { and, eq }) => and(eq(posts.id, updatedComment.id), eq(posts.userId, ctx.session.user.id)),
        with: PostRelations,
      });
      if (!updatedCommentWithRelations)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DerivedDatabaseEntityType.Comment, id).message,
        });
      return updatedCommentWithRelations;
    }),
  updatePost: getProfanityFilterProcedure(updatePostInputSchema, ["title", "description"]).mutation<PostWithRelations>(
    async ({ ctx, input: { id, ...rest } }) => {
      const updatedPost = (
        await ctx.db
          .update(posts)
          .set(rest)
          .where(and(eq(posts.id, id), isNull(posts.parentId), eq(posts.userId, ctx.session.user.id)))
          .returning({ id: posts.id })
      ).find(Boolean);
      if (!updatedPost)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Update, DatabaseEntityType.Post, id).message,
        });

      const updatedPostWithRelations = await ctx.db.query.posts.findFirst({
        where: (posts, { and, eq }) => and(eq(posts.id, updatedPost.id), eq(posts.userId, ctx.session.user.id)),
        with: PostRelations,
      });
      if (!updatedPostWithRelations)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.Post, id).message,
        });
      return updatedPostWithRelations;
    },
  ),
});
