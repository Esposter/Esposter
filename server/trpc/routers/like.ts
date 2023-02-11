import { prisma } from "@/prisma";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure";
import { ranking } from "@/services/post";
import type { Like as PrismaLike, Prisma } from "@prisma/client";
import type { toZod } from "tozod";
import { z } from "zod";

export const likeSchema: toZod<PrismaLike> = z.object({
  userId: z.string().cuid(),
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

const createLikeInputSchema = likeSchema.pick({ postId: true, value: true });
export type CreateLikeInput = z.infer<typeof createLikeInputSchema>;

const updateLikeInputSchema = likeSchema.pick({ postId: true, value: true });
export type UpdateLikeInput = z.infer<typeof updateLikeInputSchema>;

const deleteLikeInputSchema = likeSchema.pick({ postId: true });
export type DeleteLikeInput = z.infer<typeof deleteLikeInputSchema>;

export const likeRouter = router({
  createLike: authedProcedure.input(createLikeInputSchema).mutation(({ input, ctx }) =>
    prisma.$transaction(async (prisma) => {
      const newLike = await prisma.like.create({
        data: { ...input, userId: ctx.session.user.id },
        include: { post: true },
      });
      const noLikesNew = newLike.post.noLikes + newLike.value;
      await prisma.post.update({
        data: { noLikes: noLikesNew, ranking: ranking(noLikesNew, newLike.post.createdAt) },
        where: { id: newLike.post.id },
      });
      return newLike;
    })
  ),
  updateLike: authedProcedure.input(updateLikeInputSchema).mutation(async ({ input: { postId, ...rest }, ctx }) => {
    const where: Prisma.LikeWhereUniqueInput = { userId_postId: { userId: ctx.session.user.id, postId } };
    const like = await prisma.like.findUnique({ where, include: { post: true } });
    if (!like || like.value === rest.value) return null;

    const noLikesNew = like.post.noLikes + 2 * rest.value;
    const updatedLike = await prisma.like.update({
      data: {
        ...rest,
        post: { update: { noLikes: noLikesNew, ranking: ranking(noLikesNew, like.post.createdAt) } },
      },
      where,
    });
    return updatedLike;
  }),
  deleteLike: authedProcedure.input(deleteLikeInputSchema).mutation(async ({ input: { postId }, ctx }) => {
    try {
      await prisma.$transaction(async (prisma) => {
        const deletedLike = await prisma.like.delete({
          where: { userId_postId: { userId: ctx.session.user.id, postId } },
          include: { post: true },
        });
        const noLikesNew = deletedLike.post.noLikes - deletedLike.value;
        await prisma.post.update({
          data: { noLikes: noLikesNew, ranking: ranking(noLikesNew, deletedLike.post.createdAt) },
          where: { id: postId },
        });
      });
      return true;
    } catch {
      return false;
    }
  }),
});
