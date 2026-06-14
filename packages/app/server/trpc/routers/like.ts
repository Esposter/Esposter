import type { Like } from "@esposter/db-schema";

import { createLikeInputSchema } from "#shared/models/db/post/CreateLikeInput";
import { deleteLikeInputSchema } from "#shared/models/db/post/DeleteLikeInput";
import { updateLikeInputSchema } from "#shared/models/db/post/UpdateLikeInput";
import { ranking } from "@@/server/services/post/ranking";
import { router } from "@@/server/trpc";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType, likes, posts } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

export const likeRouter = router({
  createLike: standardAuthedProcedure.input(createLikeInputSchema).mutation<Like>(({ ctx, input }) =>
    ctx.db.transaction(async (tx) => {
      const post = await requireEntity(
        tx.query.posts.findFirst({
          columns: {
            createdAt: true,
            id: true,
            noLikes: true,
          },
          where: {
            id: {
              eq: input.postId,
            },
          },
        }),
        DatabaseEntityType.Post,
        input.postId,
      );
      const newLike = requireMutation(
        (
          await tx
            .insert(likes)
            .values({ ...input, userId: ctx.getSessionPayload.user.id })
            .returning()
        )[0],
        Operation.Create,
        DatabaseEntityType.Like,
        JSON.stringify(input),
      );
      const noLikesNew = post.noLikes + newLike.value;
      await tx
        .update(posts)
        .set({
          noLikes: noLikesNew,
          ranking: ranking(noLikesNew, post.createdAt),
        })
        .where(eq(posts.id, post.id));
      return newLike;
    }),
  ),
  deleteLike: standardAuthedProcedure.input(deleteLikeInputSchema).mutation<Like>(({ ctx, input }) =>
    ctx.db.transaction(async (tx) => {
      // Get post with current like count in a single query
      const post = await requireEntity(
        tx.query.posts.findFirst({
          columns: {
            createdAt: true,
            id: true,
            noLikes: true,
          },
          where: {
            id: {
              eq: input,
            },
          },
        }),
        DatabaseEntityType.Post,
        input,
      );
      const deletedLike = requireMutation(
        (
          await tx
            .delete(likes)
            .where(and(eq(likes.userId, ctx.getSessionPayload.user.id), eq(likes.postId, input)))
            .returning()
        )[0],
        Operation.Delete,
        DatabaseEntityType.Like,
        input,
      );
      const noLikesNew = post.noLikes - deletedLike.value;
      await tx
        .update(posts)
        .set({
          noLikes: noLikesNew,
          ranking: ranking(noLikesNew, post.createdAt),
        })
        .where(eq(posts.id, input));
      return deletedLike;
    }),
  ),
  updateLike: standardAuthedProcedure.input(updateLikeInputSchema).mutation<Like>(({ ctx, input: { postId, value } }) =>
    ctx.db.transaction(async (tx) => {
      const [post, like] = await Promise.all([
        tx.query.posts.findFirst({
          columns: {
            createdAt: true,
            id: true,
            noLikes: true,
          },
          where: {
            id: {
              eq: postId,
            },
          },
        }),
        tx.query.likes.findFirst({
          where: {
            postId: {
              eq: postId,
            },
            userId: {
              eq: ctx.getSessionPayload.user.id,
            },
          },
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
          message: new NotFoundError(DatabaseEntityType.Like, postId).message,
        });
      else if (like.value === value)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(
            Operation.Update,
            DatabaseEntityType.Like,
            JSON.stringify({ postId, value }),
          ).message,
        });

      const noLikesNew = post.noLikes + value * 2;
      const updatedLike = requireMutation(
        (
          await tx
            .update(likes)
            .set({ value })
            .where(and(eq(likes.userId, ctx.getSessionPayload.user.id), eq(likes.postId, postId)))
            .returning()
        )[0],
        Operation.Update,
        DatabaseEntityType.Like,
        JSON.stringify({ postId, value }),
      );
      await tx
        .update(posts)
        .set({
          noLikes: noLikesNew,
          ranking: ranking(noLikesNew, post.createdAt),
        })
        .where(eq(posts.id, postId));
      return updatedLike;
    }),
  ),
});
