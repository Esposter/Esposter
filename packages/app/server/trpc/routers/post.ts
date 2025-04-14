import type { Post, PostWithRelations } from "#shared/db/schema/posts";

import { PostRelations, posts, selectPostSchema } from "#shared/db/schema/posts";
import { createCommentInputSchema } from "#shared/models/db/post/CreateCommentInput";
import { createPostInputSchema } from "#shared/models/db/post/CreatePostInput";
import { deleteCommentInputSchema } from "#shared/models/db/post/DeleteCommentInput";
import { deletePostInputSchema } from "#shared/models/db/post/DeletePostInput";
import { updateCommentInputSchema } from "#shared/models/db/post/UpdateCommentInput";
import { updatePostInputSchema } from "#shared/models/db/post/UpdatePostInput";
import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "@@/server/services/pagination/cursor/getCursorWhere";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { ranking } from "@@/server/services/post/ranking";
import { prefault } from "@@/server/services/zod/prefault";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { getProfanityFilterProcedure } from "@@/server/trpc/procedure/getProfanityFilterProcedure";
import { rateLimitedProcedure } from "@@/server/trpc/procedure/rateLimitedProcedure";
import { NotFoundError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { z } from "zod";

const readPostInputSchema = selectPostSchema.shape.id;
export type ReadPostInput = z.infer<typeof readPostInputSchema>;

const readPostsInputSchema = prefault(
  createCursorPaginationParamsSchema(selectPostSchema.keyof(), [{ key: "ranking", order: SortOrder.Desc }]).extend(
    z.object({ [selectPostSchema.keyof().enum.parentId]: selectPostSchema.shape.parentId.default(null) }),
  ),
  {},
);
export type ReadPostsInput = z.infer<typeof readPostsInputSchema>;

export const postRouter = router({
  createComment: getProfanityFilterProcedure(createCommentInputSchema, ["description"])
    .input(createCommentInputSchema)
    .mutation<null | PostWithRelations>(async ({ ctx, input }) => {
      const parentPost = await ctx.db.query.posts.findFirst({ where: (posts, { eq }) => eq(posts.id, input.parentId) });
      if (!parentPost)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(`Parent ${DatabaseEntityType.Post}`, input.parentId).message,
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
        if (!newComment) return null;

        await tx
          .update(posts)
          .set({ noComments: parentPost.noComments + 1 })
          .where(eq(posts.id, parentPost.id));
        return newComment;
      });
      if (!newComment) return null;

      const newCommentWithRelations = await ctx.db.query.posts.findFirst({
        where: (posts, { eq }) => eq(posts.id, newComment.id),
        with: PostRelations,
      });
      return newCommentWithRelations ?? null;
    }),
  createPost: getProfanityFilterProcedure(createPostInputSchema, ["title", "description"])
    .input(createPostInputSchema)
    .mutation<null | PostWithRelations>(async ({ ctx, input }) => {
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
      if (!newPost) return null;

      const newPostWithRelations = await ctx.db.query.posts.findFirst({
        where: (posts, { eq }) => eq(posts.id, newPost.id),
        with: PostRelations,
      });
      return newPostWithRelations ?? null;
    }),
  deleteComment: authedProcedure.input(deleteCommentInputSchema).mutation<null | Post>(
    async ({ ctx, input }) =>
      await ctx.db.transaction(async (tx) => {
        const deletedComment = (
          await tx
            .delete(posts)
            .where(and(eq(posts.id, input), eq(posts.userId, ctx.session.user.id), isNotNull(posts.parentId)))
            .returning()
        ).find(Boolean);
        const postId = deletedComment?.parentId;
        if (!postId) return null;
        // Update number of comments
        const post = await ctx.db.query.posts.findFirst({ where: (posts, { eq }) => eq(posts.id, postId) });
        if (!post) return deletedComment;

        await tx
          .update(posts)
          .set({ noComments: post.noComments - 1 })
          .where(eq(posts.id, post.id));
        return deletedComment;
      }),
  ),
  deletePost: authedProcedure.input(deletePostInputSchema).mutation<null | Post>(
    async ({ ctx, input }) =>
      await ctx.db.transaction(async (tx) => {
        const deletedPost = (
          await tx
            .delete(posts)
            .where(and(eq(posts.id, input), eq(posts.userId, ctx.session.user.id), isNull(posts.parentId)))
            .returning()
        ).find(Boolean);
        if (!deletedPost) return null;
        // Delete comments
        await tx.delete(posts).where(eq(posts.parentId, deletedPost.id));
        return deletedPost;
      }),
  ),
  readPost: rateLimitedProcedure
    .input(readPostInputSchema)
    .query(({ ctx, input }) =>
      ctx.db.query.posts.findFirst({ where: (posts, { eq }) => eq(posts.id, input), with: PostRelations }),
    ),
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
    .mutation<null | PostWithRelations>(async ({ ctx, input: { id, ...rest } }) => {
      const updatedComment = (
        await ctx.db
          .update(posts)
          .set(rest)
          .where(and(eq(posts.id, id), eq(posts.userId, ctx.session.user.id)))
          .returning({ id: posts.id })
      ).find(Boolean);
      if (!updatedComment) return null;

      const updatedCommentWithRelations = await ctx.db.query.posts.findFirst({
        where: (posts, { and, eq }) => and(eq(posts.id, updatedComment.id), eq(posts.userId, ctx.session.user.id)),
        with: PostRelations,
      });
      return updatedCommentWithRelations ?? null;
    }),
  updatePost: getProfanityFilterProcedure(updatePostInputSchema, ["title", "description"])
    .input(updatePostInputSchema)
    .mutation<null | PostWithRelations>(async ({ ctx, input: { id, ...rest } }) => {
      const post = await ctx.db.query.posts.findFirst({
        where: (posts, { and, eq }) => and(eq(posts.id, id), isNull(posts.parentId)),
      });
      if (!post)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.Post, `${posts.id}, you might be trying to update a comment`)
            .message,
        });

      const updatedPost = (
        await ctx.db
          .update(posts)
          .set(rest)
          .where(and(eq(posts.id, id), eq(posts.userId, ctx.session.user.id)))
          .returning({ id: posts.id })
      ).find(Boolean);
      if (!updatedPost) return null;

      const updatedPostWithRelations = await ctx.db.query.posts.findFirst({
        where: (posts, { and, eq }) => and(eq(posts.id, updatedPost.id), eq(posts.userId, ctx.session.user.id)),
        with: PostRelations,
      });
      return updatedPostWithRelations ?? null;
    }),
});
