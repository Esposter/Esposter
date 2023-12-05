import { db } from "@/db";
import { PostRelations, posts, selectPostSchema, type PostWithRelations } from "@/db/schema/posts";
import { createPaginationSchema } from "@/models/shared/pagination/Pagination";
import { router } from "@/server/trpc";
import { authedProcedure, rateLimitedProcedure } from "@/server/trpc/procedure";
import { ranking } from "@/services/post/ranking";
import { convertColumnsMapSortByToSql } from "@/services/shared/pagination/convertColumnsMapSortByToSql";
import { getPaginationData } from "@/services/shared/pagination/getPaginationData";
import { eq, gt } from "drizzle-orm";
import { z } from "zod";

const readPostInputSchema = selectPostSchema.shape.id;
export type ReadPostInput = z.infer<typeof readPostInputSchema>;

const readPostsInputSchema = createPaginationSchema(selectPostSchema.keyof()).default({});
export type ReadPostsInput = z.infer<typeof readPostsInputSchema>;

const createPostInputSchema = selectPostSchema
  .pick({ title: true })
  .merge(selectPostSchema.partial().pick({ description: true }));
export type CreatePostInput = z.infer<typeof createPostInputSchema>;

const updatePostInputSchema = selectPostSchema
  .pick({ id: true })
  .merge(selectPostSchema.partial().pick({ title: true, description: true }));
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;

const deletePostInputSchema = selectPostSchema.shape.id;
export type DeletePostInput = z.infer<typeof deletePostInputSchema>;

export const postRouter = router({
  readPost: rateLimitedProcedure
    .input(readPostInputSchema)
    .query(({ input }) => db.query.posts.findFirst({ where: (posts, { eq }) => eq(posts.id, input) })),
  readPosts: rateLimitedProcedure.input(readPostsInputSchema).query(async ({ input: { cursor, limit, sortBy } }) => {
    const posts: PostWithRelations[] = await db.query.posts.findMany({
      where: cursor ? (posts) => gt(posts.id, cursor) : undefined,
      orderBy: (posts, { desc }) =>
        sortBy.length > 0 ? convertColumnsMapSortByToSql(posts, sortBy) : desc(posts.ranking),
      limit: limit + 1,
      with: PostRelations,
    });
    return getPaginationData(posts, "id", limit);
  }),
  createPost: authedProcedure.input(createPostInputSchema).mutation(async ({ input, ctx }) => {
    const now = new Date();
    const newPost = (
      await db
        .insert(posts)
        .values({
          ...input,
          creatorId: ctx.session.user.id,
          createdAt: now,
          ranking: ranking(0, now),
        })
        .returning({ id: posts.id })
    )[0];
    const newPostWithRelations = await db.query.posts.findFirst({
      where: (posts, { eq }) => eq(posts.id, newPost.id),
      with: PostRelations,
    });
    return newPostWithRelations ?? null;
  }),
  updatePost: authedProcedure.input(updatePostInputSchema).mutation(async ({ input: { id, ...rest } }) => {
    const updatedPost = (await db.update(posts).set(rest).where(eq(posts.id, id)).returning({ id: posts.id }))[0];
    const updatedPostWithRelations = await db.query.posts.findFirst({
      where: (posts, { eq }) => eq(posts.id, updatedPost.id),
      with: PostRelations,
    });
    return updatedPostWithRelations ?? null;
  }),
  deletePost: authedProcedure.input(deletePostInputSchema).mutation(async ({ input }) => {
    await db.delete(posts).where(eq(posts.id, input));
  }),
});
