import { prisma } from "@/prisma";
import { router } from "@/server/trpc";
import { rateLimitedProcedure } from "@/server/trpc/procedure";
import { ranking } from "@/services/post";
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
  createLike: rateLimitedProcedure.input(createLikeInputSchema).mutation(({ input }) =>
    prisma.$transaction(async (prisma) => {
      const newLike = await prisma.like.create({ data: input, include: { post: true } });
      const noLikesNew = newLike.post.noLikes + newLike.value;
      await prisma.post.update({
        data: { noLikes: noLikesNew, ranking: ranking(noLikesNew, newLike.post.createdAt) },
        where: { id: newLike.post.id },
      });
      return newLike;
    })
  ),
  updateLike: rateLimitedProcedure
    .input(updateLikeInputSchema)
    .mutation(async ({ input: { userId, postId, ...other } }) => {
      const like = await prisma.like.findUnique({
        where: { userId_postId: { userId, postId } },
        include: { post: true },
      });
      if (!like || like.value === other.value) return null;

      const noLikesNew = like.post.noLikes + 2 * other.value;
      const updatedLike = await prisma.like.update({
        data: {
          ...other,
          post: { update: { noLikes: noLikesNew, ranking: ranking(noLikesNew, like.post.createdAt) } },
        },
        where: { userId_postId: { userId, postId } },
      });
      return updatedLike;
    }),
  deleteLike: rateLimitedProcedure.input(deleteLikeInputSchema).mutation(async ({ input }) => {
    try {
      await prisma.$transaction(async (prisma) => {
        const deletedLike = await prisma.like.delete({ where: { userId_postId: input }, include: { post: true } });
        const noLikesNew = deletedLike.post.noLikes - deletedLike.value;
        await prisma.post.update({
          data: { noLikes: noLikesNew, ranking: ranking(noLikesNew, deletedLike.post.createdAt) },
          where: { id: input.postId },
        });
      });
      return true;
    } catch (err) {
      return false;
    }
  }),
});
