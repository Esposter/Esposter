import { prisma } from "@/prisma";
import { PostRelationsIncludeDefault } from "@/prisma/types";
import { router } from "@/server/trpc";
import { authedProcedure, rateLimitedProcedure } from "@/server/trpc/procedure";
import { ranking } from "@/services/post";
import { FETCH_LIMIT, getNextCursor } from "@/utils/pagination";
import { POST_DESCRIPTION_MAX_LENGTH, POST_TITLE_MAX_LENGTH } from "@/utils/validation";
import type { Post as PrismaPost } from "@prisma/client";
import type { toZod } from "tozod";
import { z } from "zod";

export const postSchema: toZod<PrismaPost> = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(POST_TITLE_MAX_LENGTH),
  description: z.string().max(POST_DESCRIPTION_MAX_LENGTH),
  noLikes: z.number().int().nonnegative(),
  noComments: z.number().int().nonnegative(),
  ranking: z.number(),
  creatorId: z.string().uuid(),
  depth: z.number().int(),
  parentId: z.string().uuid().nullable(),
  createdAt: z.date(),
  updated: z.boolean(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

const readPostInputSchema = postSchema.shape.id.optional();
export type ReadPostInput = z.infer<typeof readPostInputSchema>;

const readPostsInputSchema = z.object({
  cursor: z.string().nullable(),
});
export type ReadPostsInput = z.infer<typeof readPostsInputSchema>;

const createPostInputSchema = postSchema.pick({ title: true }).merge(postSchema.partial().pick({ description: true }));
export type CreatePostInput = z.infer<typeof createPostInputSchema>;

const updatePostInputSchema = postSchema
  .pick({ id: true })
  .merge(postSchema.partial().pick({ title: true, description: true }));
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;

const deletePostInputSchema = postSchema.shape.id;
export type DeletePostInput = z.infer<typeof deletePostInputSchema>;

export const postRouter = router({
  readPost: rateLimitedProcedure
    .input(readPostInputSchema)
    .query(({ input }) =>
      input ? prisma.post.findUnique({ where: { id: input } }) : prisma.post.findFirst({ orderBy: { ranking: "desc" } })
    ),
  readPosts: rateLimitedProcedure.input(readPostsInputSchema).query(async ({ input: { cursor } }) => {
    const posts = await prisma.post.findMany({
      take: FETCH_LIMIT + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { ranking: "desc" },
      include: PostRelationsIncludeDefault,
    });
    return { posts, nextCursor: getNextCursor(posts, "id", FETCH_LIMIT) };
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
      prisma.post.update({ data: rest, where: { id }, include: PostRelationsIncludeDefault })
    ),
  deletePost: authedProcedure.input(deletePostInputSchema).mutation(async ({ input }) => {
    try {
      await prisma.post.delete({ where: { id: input } });
      return true;
    } catch {
      return false;
    }
  }),
});
