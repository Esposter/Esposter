import { prisma } from "@/prisma";
import { publicProcedure, router } from "@/server/trpc";
import type { Like as PrismaLike } from "@prisma/client";
import { toZod } from "tozod";
import { z } from "zod";

export const likeSchema: toZod<PrismaLike> = z.object({
  userId: z.string().uuid(),
  postId: z.string().uuid(),
  value: z
    .number()
    .int()
    .refine((value) => value === 1 || value === -1)
    .innerType(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

const createLikeInputSchema = likeSchema.pick({ userId: true, postId: true, value: true });
export type CreateLikeInput = z.infer<typeof createLikeInputSchema>;

const updateLikeInputSchema = likeSchema.pick({ userId: true, postId: true, value: true });
export type UpdateLikeInput = z.infer<typeof updateLikeInputSchema>;

const deleteLikeInputSchema = likeSchema.pick({ userId: true, postId: true });
export type DeleteLikeInput = z.infer<typeof deleteLikeInputSchema>;

export const likeRouter = router({
  createLike: publicProcedure.input(createLikeInputSchema).mutation(async ({ input }) => {
    const [like] = await prisma.$transaction([
      prisma.like.create({ data: input }),
      prisma.post.update({ data: { noLikes: { increment: input.value } }, where: { id: input.postId } }),
    ]);
    return like;
  }),
  updateLike: publicProcedure.input(updateLikeInputSchema).mutation(async ({ input: { userId, postId, ...other } }) => {
    const like = await prisma.like.findUnique({ where: { userId_postId: { userId, postId } } });
    if (!like || like.value === other.value) return null;

    const updatedLike = await prisma.like.update({
      data: { ...other, post: { update: { noLikes: { increment: 2 * other.value } } } },
      where: { userId_postId: { userId, postId } },
    });
    return updatedLike;
  }),
  deleteLike: publicProcedure.input(deleteLikeInputSchema).mutation(async ({ input }) => {
    try {
      await prisma.$transaction(async (prisma) => {
        const deletedLike = await prisma.like.delete({ where: { userId_postId: input } });
        await prisma.post.update({ data: { noLikes: { decrement: deletedLike.value } }, where: { id: input.postId } });
      });
      return true;
    } catch (err) {
      return false;
    }
  }),
});
