import { testUser } from "@/assets/data/test";
import { prisma } from "@/prisma";
import { publicProcedure, router } from "@/server/trpc";
import { FETCH_LIMIT, POST_MAX_DESCRIPTION_LENGTH, POST_MAX_TITLE_LENGTH } from "@/util/constants.common";
import type { Post as PrismaPost } from "@prisma/client";
import { toZod } from "tozod";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { getNextCursor } from "~~/util/pagination";

export const postSchema: toZod<PrismaPost> = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(POST_MAX_TITLE_LENGTH),
  description: z.string().max(POST_MAX_DESCRIPTION_LENGTH),
  noPoints: z.number().nonnegative(),
  noComments: z.number().nonnegative(),
  ranking: z.number(),
  creatorId: z.string().uuid(),
  depth: z.number(),
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
  readPost: publicProcedure
    .input(readPostInputSchema)
    .query(({ input }) =>
      input
        ? prisma.post.findUnique({ where: { id: input } })
        : prisma.post.findFirst({ orderBy: { updatedAt: "desc" } })
    ),
  readPosts: publicProcedure.input(readPostsInputSchema).query(async ({ input: { cursor } }) => {
    const posts = await prisma.post.findMany({
      take: FETCH_LIMIT + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
      include: { creator: true },
    });
    return { posts, nextCursor: getNextCursor(posts, "id", FETCH_LIMIT) };
  }),
  createPost: publicProcedure.input(createPostInputSchema).mutation(({ input }) =>
    prisma.post.create({
      data: { ...input, id: uuidv4(), creatorId: testUser.id, ranking: 0 },
      include: { creator: true },
    })
  ),
  updatePost: publicProcedure
    .input(updatePostInputSchema)
    .mutation(({ input: { id, ...other } }) =>
      prisma.post.update({ data: other, where: { id }, include: { creator: true } })
    ),
  deletePost: publicProcedure.input(deletePostInputSchema).mutation(async ({ input }) => {
    try {
      await prisma.post.delete({ where: { id: input } });
      return true;
    } catch (err) {
      return false;
    }
  }),
});
