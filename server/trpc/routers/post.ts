import { db } from "@/db";
import { PostRelations, posts, selectPostSchema, type PostWithRelations } from "@/db/schema/posts";
import { createCursorPaginationParamsSchema } from "@/models/shared/pagination/CursorPaginationParams";
import { router } from "@/server/trpc";
import { authedProcedure, rateLimitedProcedure } from "@/server/trpc/procedure";
import { ranking } from "@/services/post/ranking";
import { convertColumnsMapSortByToSql } from "@/services/shared/pagination/convertColumnsMapSortByToSql";
import { getCursorPaginationData } from "@/services/shared/pagination/getCursorPaginationData";
import { and, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";

const readPostInputSchema = selectPostSchema.shape.id;
export type ReadPostInput = z.infer<typeof readPostInputSchema>;

const readPostsInputSchema = z
  .object({ [selectPostSchema.keyof().Values.parentId]: selectPostSchema.shape.parentId.default(null) })
  .merge(createCursorPaginationParamsSchema(selectPostSchema.keyof()))
  .default({});
export type ReadPostsInput = z.infer<typeof readPostsInputSchema>;

const createPostInputSchema = selectPostSchema
  .pick({ title: true })
  .merge(selectPostSchema.partial().pick({ description: true }));
export type CreatePostInput = z.infer<typeof createPostInputSchema>;

const createCommentInputSchema = selectPostSchema
  .pick({ description: true })
  // @TODO: https://github.com/colinhacks/zod/issues/2891
  .extend({ description: z.string().min(1) })
  .merge(z.object({ [selectPostSchema.keyof().Values.parentId]: selectPostSchema.shape.parentId.unwrap() }));
export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;

const updatePostInputSchema = selectPostSchema
  .pick({ id: true })
  .merge(selectPostSchema.partial().pick({ title: true, description: true }));
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;

const updateCommentInputSchema = selectPostSchema
  .pick({ id: true, description: true })
  // @TODO: https://github.com/colinhacks/zod/issues/2891
  .extend({ description: z.string().min(1) });
export type UpdateCommentInput = z.infer<typeof updateCommentInputSchema>;

const deletePostInputSchema = selectPostSchema.shape.id;
export type DeletePostInput = z.infer<typeof deletePostInputSchema>;

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
      const cursorWhere = cursor ? gt(posts.id, cursor) : undefined;
      const where = cursorWhere ? and(parentIdWhere, cursorWhere) : parentIdWhere;

      const resultPosts: PostWithRelations[] = await db.query.posts.findMany({
        where,
        orderBy: (posts, { desc }) =>
          sortBy.length > 0 ? convertColumnsMapSortByToSql(posts, sortBy) : desc(posts.ranking),
        limit: limit + 1,
        with: PostRelations,
      });
      return getCursorPaginationData(resultPosts, "id", limit);
    }),
  createPost: authedProcedure.input(createPostInputSchema).mutation(async ({ input, ctx }) => {
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
  createComment: authedProcedure.input(createCommentInputSchema).mutation(async ({ input, ctx }) => {
    const parentPost = await db.query.posts.findFirst({ where: (posts, { eq }) => eq(posts.id, input.parentId) });
    if (!parentPost) throw Error("Cannot find parent post");

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
  updatePost: authedProcedure.input(updatePostInputSchema).mutation(async ({ input: { id, ...rest }, ctx }) => {
    const post = await db.query.posts.findFirst({
      where: (posts, { and, eq }) => and(eq(posts.id, id), isNull(posts.parentId)),
    });
    if (!post) throw Error("Cannot find post, you might be trying to update a comment");

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
  updateComment: authedProcedure.input(updateCommentInputSchema).mutation(async ({ input: { id, ...rest }, ctx }) => {
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
  deletePost: authedProcedure.input(deletePostInputSchema).mutation(async ({ input, ctx }) => {
    await db.delete(posts).where(and(eq(posts.id, input), eq(posts.creatorId, ctx.session.user.id)));
  }),
});
