import type { Like } from "#shared/db/schema/likes";

import { likes } from "#shared/db/schema/likes";
import { posts } from "#shared/db/schema/posts";
import { createLikeInputSchema } from "#shared/models/db/post/CreateLikeInput";
import { deleteLikeInputSchema } from "#shared/models/db/post/DeleteLikeInput";
import { updateLikeInputSchema } from "#shared/models/db/post/UpdateLikeInput";
import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { ranking } from "@@/server/services/post/ranking";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

export const likeRouter = router({
  createLike: authedProcedure.input(createLikeInputSchema).mutation<Like>(async ({ ctx, input }) => {
    const post = await ctx.db.query.posts.findFirst({ where: (posts, { eq }) => eq(posts.id, input.postId) });
    if (!post)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: new NotFoundError(DatabaseEntityType.Post, input.postId).message,
      });

    return ctx.db.transaction(async (tx) => {
      const newLike = (
        await tx
          .insert(likes)
          .values({ ...input, userId: ctx.session.user.id })
          .returning()
      ).find(Boolean);
      if (!newLike)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Like, JSON.stringify(input)).message,
        });

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
  deleteLike: authedProcedure.input(deleteLikeInputSchema).mutation<Like>(async ({ ctx, input }) => {
    const post = await ctx.db.query.posts.findFirst({ where: (posts, { eq }) => eq(posts.id, input) });
    if (!post)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: new NotFoundError(DatabaseEntityType.Post, input).message,
      });

    return ctx.db.transaction(async (tx) => {
      const deletedLike = (
        await tx
          .delete(likes)
          .where(and(eq(likes.userId, ctx.session.user.id), eq(likes.postId, input)))
          .returning()
      ).find(Boolean);
      if (!deletedLike)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(
            Operation.Delete,
            DatabaseEntityType.Like,
            JSON.stringify({ postId: input }),
          ).message,
        });

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
  updateLike: authedProcedure.input(updateLikeInputSchema).mutation<Like>(async ({ ctx, input: { postId, value } }) => {
    const [post, like] = await Promise.all([
      ctx.db.query.posts.findFirst({ where: (posts, { eq }) => eq(posts.id, postId) }),
      ctx.db.query.likes.findFirst({
        where: (likes, { and, eq }) => and(eq(likes.userId, ctx.session.user.id), eq(likes.postId, postId)),
      }),
    ]);
    if (!post)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: new NotFoundError(DatabaseEntityType.Post, postId).message,
      });
    else if (!like)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: new NotFoundError(DatabaseEntityType.Like, JSON.stringify({ postId })).message,
      });
    else if (like.value === value)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(Operation.Update, DatabaseEntityType.Like, JSON.stringify({ value }))
          .message,
      });

    const noLikesNew = post.noLikes + value * 2;
    return ctx.db.transaction(async (tx) => {
      const updatedLike = (
        await tx
          .update(likes)
          .set({ value })
          .where(and(eq(likes.userId, ctx.session.user.id), eq(likes.postId, postId)))
          .returning()
      ).find(Boolean);
      if (!updatedLike)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Update, DatabaseEntityType.Like, JSON.stringify({ value }))
            .message,
        });

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
});
