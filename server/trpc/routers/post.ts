import { db } from "@/db";
import type { Post, PostWithRelations } from "@/db/schema/posts";
import { PostRelations, posts, selectPostSchema } from "@/db/schema/posts";
import { DatabaseEntityType } from "@/models/shared/entity/DatabaseEntityType";
import { createCursorPaginationParamsSchema } from "@/models/shared/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "@/models/shared/pagination/sorting/SortOrder";
import { router } from "@/server/trpc";
import { authedProcedure, rateLimitedProcedure } from "@/server/trpc/procedure";
import { ranking } from "@/services/post/ranking";
import { getCursorPaginationData } from "@/services/shared/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "@/services/shared/pagination/cursor/getCursorWhere";
import { parseSortByToSql } from "@/services/shared/pagination/sorting/parseSortByToSql";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { z } from "zod";
import { NotFoundError } from "~/packages/shared/models/error/NotFoundError";

const readPostInputSchema = selectPostSchema.shape.id;
export type ReadPostInput = z.infer<typeof readPostInputSchema>;

const readPostsInputSchema = z
  .object({ [selectPostSchema.keyof().Values.parentId]: selectPostSchema.shape.parentId.default(null) })
  .merge(createCursorPaginationParamsSchema(selectPostSchema.keyof(), [{ key: "ranking", order: SortOrder.Desc }]))
  .default({});
export type ReadPostsInput = z.infer<typeof readPostsInputSchema>;

const createPostInputSchema = selectPostSchema
  .pick({ title: true })
  .merge(selectPostSchema.partial().pick({ description: true }));
export type CreatePostInput = z.infer<typeof createPostInputSchema>;

const createCommentInputSchema = selectPostSchema
  .pick({ description: true })
  .extend({ description: z.string().min(1) })
  .merge(z.object({ [selectPostSchema.keyof().Values.parentId]: selectPostSchema.shape.parentId.unwrap() }));
export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;

const updatePostInputSchema = selectPostSchema
  .pick({ id: true })
  .merge(selectPostSchema.partial().pick({ title: true, description: true }));
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;

const updateCommentInputSchema = selectPostSchema
  .pick({ id: true, description: true })
  .extend({ description: z.string().min(1) });
export type UpdateCommentInput = z.infer<typeof updateCommentInputSchema>;

const deletePostInputSchema = selectPostSchema.shape.id;
export type DeletePostInput = z.infer<typeof deletePostInputSchema>;

const deleteCommentInputSchema = selectPostSchema.shape.id;
export type DeleteCommentInput = z.infer<typeof deleteCommentInputSchema>;

export const postRouter = router({
  readPost: rateLimitedProcedure
    .input(readPostInputSchema)
    .query(({ input }) =>
      db.query.posts.findFirst({ where: (posts, { eq }) => eq(posts.id, input), with: PostRelations }),
    ),
  readPosts: rateLimitedProcedure
    .input(readPostsInputSchema)
    .query(async ({ input: { parentId, cursor, limit, sortBy } }) => {
      const parentIdWhere = parentId ? eq(posts.parentId, parentId) : isNull(posts.parentId);
      const cursorWhere = cursor ? getCursorWhere(posts, cursor, sortBy) : undefined;
      const where = cursorWhere ? and(parentIdWhere, cursorWhere) : parentIdWhere;

      const resultPosts: PostWithRelations[] = await db.query.posts.findMany({
        where,
        orderBy: parseSortByToSql(posts, sortBy),
        limit: limit + 1,
        with: PostRelations,
      });
      return getCursorPaginationData(resultPosts, limit, sortBy);
    }),
  createPost: authedProcedure
    .input(createPostInputSchema)
    .mutation<PostWithRelations | null>(async ({ input, ctx }) => {
      const createdAt = new Date();
      const newPost = (
        await db
          .insert(posts)
          .values({
            ...input,
            creatorId: ctx.session.user.id,
            createdAt,
            ranking: ranking(0, createdAt),
          })
          .returning({ id: posts.id })
      )[0];
      const newPostWithRelations = await db.query.posts.findFirst({
        where: (posts, { eq }) => eq(posts.id, newPost.id),
        with: PostRelations,
      });
      return newPostWithRelations ?? null;
    }),
  createComment: authedProcedure
    .input(createCommentInputSchema)
    .mutation<PostWithRelations | null>(async ({ input, ctx }) => {
      const parentPost = await db.query.posts.findFirst({ where: (posts, { eq }) => eq(posts.id, input.parentId) });
      if (!parentPost) throw new NotFoundError(`Parent ${DatabaseEntityType.Post}`, input.parentId);

      const newComment = await db.transaction(async (tx) => {
        const createdAt = new Date();
        const newComment = (
          await tx
            .insert(posts)
            .values({
              ...input,
              creatorId: ctx.session.user.id,
              createdAt,
              depth: parentPost.depth + 1,
              ranking: ranking(0, createdAt),
            })
            .returning({ id: posts.id })
        )[0];
        await tx
          .update(posts)
          .set({ noComments: parentPost.noComments + 1 })
          .where(eq(posts.id, parentPost.id));
        return newComment;
      });
      const newCommentWithRelations = await db.query.posts.findFirst({
        where: (posts, { eq }) => eq(posts.id, newComment.id),
        with: PostRelations,
      });
      return newCommentWithRelations ?? null;
    }),
  updatePost: authedProcedure
    .input(updatePostInputSchema)
    .mutation<PostWithRelations | null>(async ({ input: { id, ...rest }, ctx }) => {
      const post = await db.query.posts.findFirst({
        where: (posts, { and, eq }) => and(eq(posts.id, id), isNull(posts.parentId)),
      });
      if (!post)
        throw new NotFoundError(DatabaseEntityType.Post, `${posts.id}, you might be trying to update a comment`);

      const updatedPost = (
        await db
          .update(posts)
          .set(rest)
          .where(and(eq(posts.id, id), eq(posts.creatorId, ctx.session.user.id)))
          .returning({ id: posts.id })
      )[0];
      const updatedPostWithRelations = await db.query.posts.findFirst({
        where: (posts, { and, eq }) => and(eq(posts.id, updatedPost.id), eq(posts.creatorId, ctx.session.user.id)),
        with: PostRelations,
      });
      return updatedPostWithRelations ?? null;
    }),
  updateComment: authedProcedure
    .input(updateCommentInputSchema)
    .mutation<PostWithRelations | null>(async ({ input: { id, ...rest }, ctx }) => {
      const updatedComment = (
        await db
          .update(posts)
          .set(rest)
          .where(and(eq(posts.id, id), eq(posts.creatorId, ctx.session.user.id)))
          .returning({ id: posts.id })
      )[0];
      const updatedCommentWithRelations = await db.query.posts.findFirst({
        where: (posts, { and, eq }) => and(eq(posts.id, updatedComment.id), eq(posts.creatorId, ctx.session.user.id)),
        with: PostRelations,
      });
      return updatedCommentWithRelations ?? null;
    }),
  deletePost: authedProcedure.input(deletePostInputSchema).mutation<Post | null>(
    async ({ input, ctx }) =>
      await db.transaction(async (tx) => {
        const deletedPost = (
          await tx
            .delete(posts)
            .where(and(eq(posts.id, input), eq(posts.creatorId, ctx.session.user.id), isNull(posts.parentId)))
            .returning()
        ).find(Boolean);
        if (!deletedPost) return null;
        // Delete comments
        await tx.delete(posts).where(eq(posts.parentId, deletedPost.id));
        return deletedPost;
      }),
  ),
  deleteComment: authedProcedure.input(deleteCommentInputSchema).mutation<Post | null>(
    async ({ input, ctx }) =>
      await db.transaction(async (tx) => {
        const deletedComment = (
          await tx
            .delete(posts)
            .where(and(eq(posts.id, input), eq(posts.creatorId, ctx.session.user.id), isNotNull(posts.parentId)))
            .returning()
        ).find(Boolean);
        const postId = deletedComment?.parentId;
        if (!postId) return null;
        // Update number of comments
        const post = await db.query.posts.findFirst({ where: (posts, { eq }) => eq(posts.id, postId) });
        if (!post) return deletedComment;

        await tx
          .update(posts)
          .set({ noComments: post.noComments - 1 })
          .where(eq(posts.id, post.id));
        return deletedComment;
      }),
  ),
});
