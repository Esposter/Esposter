import type { Post as PrismaPost } from "@prisma/client";
import { toZod } from "tozod";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { prisma } from "@/prisma";
import { publicProcedure, router } from "@/server/trpc";
import { testUser } from "@/server/trpc/routers";
import { POST_MAX_DESCRIPTION_LENGTH, POST_MAX_TITLE_LENGTH } from "@/util/constants.common";

export const postSchema: toZod<PrismaPost> = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(POST_MAX_TITLE_LENGTH),
  description: z.string().max(POST_MAX_DESCRIPTION_LENGTH),
  noPoints: z.number().nonnegative(),
  noComments: z.number().nonnegative(),
  ranking: z.number(),
  edited: z.boolean(),
  creatorId: z.string().uuid(),
  depth: z.number(),
  parentId: z.string().uuid().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

const createPostInputSchema = postSchema.pick({ title: true }).merge(postSchema.partial().pick({ description: true }));
export type CreatePostInput = z.infer<typeof createPostInputSchema>;

const updatePostInputSchema = postSchema
  .pick({ id: true })
  .merge(postSchema.partial().pick({ title: true, description: true }));
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;

const deletePostInputSchema = postSchema.shape.id;
export type DeletePostInput = z.infer<typeof deletePostInputSchema>;

export const postRouter = router({
  createPost: publicProcedure
    .input(createPostInputSchema)
    .mutation(({ input }) =>
      prisma.post.create({ data: { id: uuidv4(), creatorId: testUser.id, ranking: 0, ...input } })
    ),
  updatePost: publicProcedure
    .input(updatePostInputSchema)
    .mutation(({ input: { id, ...other } }) => prisma.post.update({ data: other, where: { id } })),
  deletePost: publicProcedure.input(deletePostInputSchema).mutation(async ({ input }) => {
    try {
      await prisma.post.delete({ where: { id: input } });
      return true;
    } catch (err) {
      return false;
    }
  }),
});
