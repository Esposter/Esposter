import { db } from "@/db";
import { PostRelations, posts, selectPostSchema } from "@/db/schema/posts";
import { router } from "@/server/trpc";
import { authedProcedure, rateLimitedProcedure } from "@/server/trpc/procedure";
import { ranking } from "@/services/post/ranking";
import { READ_LIMIT, getNextCursor } from "@/util/pagination";
import { eq, gt } from "drizzle-orm";
import { z } from "zod";

const readPostInputSchema = selectPostSchema.shape.id;
export type ReadPostInput = z.infer<typeof readPostInputSchema>;

const readPostsInputSchema = z.object({
  cursor: z.string().nullable(),
});
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
  readPosts: rateLimitedProcedure.input(readPostsInputSchema).query(async ({ input: { cursor } }) => {
    const posts = await db.query.posts.findMany({
      where: cursor ? (posts) => gt(posts.id, cursor) : undefined,
      orderBy: (posts, { desc }) => desc(posts.ranking),
      limit: READ_LIMIT + 1,
      with: PostRelations,
    });
    return { posts, nextCursor: getNextCursor(posts, "id", READ_LIMIT) };
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
    const updatedPost = (await db.update(posts).set(rest).returning({ id: posts.id }))[0];
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
