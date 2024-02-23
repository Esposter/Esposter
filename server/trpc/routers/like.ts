import { db } from "@/db";
import { posts } from "@/db/schema/posts";
import type { Like } from "@/db/schema/users";
import { likes, selectLikeSchema } from "@/db/schema/users";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure";
import { ranking } from "@/services/post/ranking";
import { and, eq } from "drizzle-orm";
import type { z } from "zod";

const createLikeInputSchema = selectLikeSchema.pick({ postId: true, value: true });
export type CreateLikeInput = z.infer<typeof createLikeInputSchema>;

const updateLikeInputSchema = selectLikeSchema.pick({ postId: true, value: true });
export type UpdateLikeInput = z.infer<typeof updateLikeInputSchema>;

const deleteLikeInputSchema = selectLikeSchema.shape.postId;
export type DeleteLikeInput = z.infer<typeof deleteLikeInputSchema>;

export const likeRouter = router({
  createLike: authedProcedure.input(createLikeInputSchema).mutation<Like | null>(async ({ input, ctx }) => {
    const post = await db.query.posts.findFirst({ where: (posts, { eq }) => eq(posts.id, input.postId) });
    if (!post) return null;

    return db.transaction(async (tx) => {
      const newLike = (
        await tx
          .insert(likes)
          .values({ ...input, userId: ctx.session.user.id })
          .returning()
      )[0];
      if (!newLike) return null;

      const noLikesNew = post.noLikes + newLike.value;
      await tx
        .update(posts)
        .set({
          noLikes: noLikesNew,
          ranking: ranking(noLikesNew, post.createdAt),
        })
        .where(eq(posts.id, post.id));
      return newLike;
    });
  }),
  updateLike: authedProcedure
    .input(updateLikeInputSchema)
    .mutation<Like | null>(async ({ input: { postId, ...rest }, ctx }) => {
      const [post, like] = await Promise.all([
        db.query.posts.findFirst({ where: (posts, { eq }) => eq(posts.id, postId) }),
        db.query.likes.findFirst({
          where: (likes, { and, eq }) => and(eq(likes.userId, ctx.session.user.id), eq(likes.postId, postId)),
        }),
      ]);
      if (!post || !like || like.value === rest.value) return null;

      const noLikesNew = post.noLikes + rest.value * 2;

      return db.transaction(async (tx) => {
        const updatedLike = (
          await tx
            .update(likes)
            .set(rest)
            .where(and(eq(likes.userId, ctx.session.user.id), eq(likes.postId, postId)))
            .returning()
        )[0];
        if (!updatedLike) return null;

        await tx
          .update(posts)
          .set({
            noLikes: noLikesNew,
            ranking: ranking(noLikesNew, post.createdAt),
          })
          .where(eq(posts.id, postId));
        return updatedLike;
      });
    }),
  deleteLike: authedProcedure.input(deleteLikeInputSchema).mutation<Like | null>(async ({ input, ctx }) => {
    const post = await db.query.posts.findFirst({ where: (posts, { eq }) => eq(posts.id, input) });
    if (!post) return null;

    return db.transaction(async (tx) => {
      const deletedLike = (
        await tx
          .delete(likes)
          .where(and(eq(likes.userId, ctx.session.user.id), eq(likes.postId, input)))
          .returning()
      )[0];
      if (!deletedLike) return null;

      const noLikesNew = post.noLikes - deletedLike.value;
      await tx
        .update(posts)
        .set({
          noLikes: noLikesNew,
          ranking: ranking(noLikesNew, post.createdAt),
        })
        .where(eq(posts.id, input));
      return deletedLike;
    });
  }),
});
