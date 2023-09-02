import { selectPostSchema } from "@/db/schema/posts";
import { prisma } from "@/prisma";
import { PostRelationsIncludeDefault } from "@/prisma/types";
import { router } from "@/server/trpc";
import { authedProcedure, rateLimitedProcedure } from "@/server/trpc/procedure";
import { ranking } from "@/services/post/ranking";
import { READ_LIMIT, getNextCursor } from "@/utils/pagination";
import { z } from "zod";

const readPostInputSchema = selectPostSchema.shape.id.optional();
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
    .query(({ input }) =>
      input
        ? prisma.post.findUnique({ where: { id: input } })
        : prisma.post.findFirst({ orderBy: { ranking: "desc" } }),
    ),
  readPosts: rateLimitedProcedure.input(readPostsInputSchema).query(async ({ input: { cursor } }) => {
    const posts = await prisma.post.findMany({
      take: READ_LIMIT + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { ranking: "desc" },
      include: PostRelationsIncludeDefault,
    });
    return { posts, nextCursor: getNextCursor(posts, "id", READ_LIMIT) };
  }),
  createPost: authedProcedure.input(createPostInputSchema).mutation(({ input, ctx }) => {
    const now = new Date();
    return prisma.post.create({
      data: { ...input, creatorId: ctx.session.user.id, createdAt: now, ranking: ranking(0, now) },
      include: PostRelationsIncludeDefault,
    });
  }),
  updatePost: authedProcedure
    .input(updatePostInputSchema)
    .mutation(({ input: { id, ...rest } }) =>
      prisma.post.update({ data: rest, where: { id }, include: PostRelationsIncludeDefault }),
    ),
  deletePost: authedProcedure.input(deletePostInputSchema).mutation(async ({ input }) => {
    await prisma.post.delete({ where: { id: input } });
  }),
});
