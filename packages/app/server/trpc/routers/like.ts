import type { Transaction } from "@@/server/models/db/Transaction";
import type { Like } from "@esposter/db-schema";

import { createLikeInputSchema } from "#shared/models/db/post/CreateLikeInput";
import { deleteLikeInputSchema } from "#shared/models/db/post/DeleteLikeInput";
import { updateLikeInputSchema } from "#shared/models/db/post/UpdateLikeInput";
import { getPostRanking } from "@@/server/services/post/getPostRanking";
import { router } from "@@/server/trpc";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { getNotFoundError } from "@@/server/trpc/guards/getNotFoundError";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType, likes, posts } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { and, eq } from "drizzle-orm";

// Every vote write is a read-modify-write of `likeCount`, so the row is locked for the rest of the transaction:
// Two votes landing together would otherwise both read the pre-vote count and the later write would replace
// Rather than add, losing a vote and leaving `ranking` derived from a count that never existed. The lock is also
// What lets `getPostRanking` stay the one ranking formula, since a SQL-side increment could not call it
const readLikedPost = async (tx: Transaction, postId: string) =>
  (
    await tx
      .select({ createdAt: posts.createdAt, id: posts.id, likeCount: posts.likeCount })
      .from(posts)
      .where(eq(posts.id, postId))
      .for("update")
  )[0];

const updateLikeCount = (tx: Transaction, post: { createdAt: Date; id: string }, likeCount: number) =>
  tx
    .update(posts)
    .set({ likeCount, ranking: getPostRanking(likeCount, post.createdAt) })
    .where(eq(posts.id, post.id));

export const likeRouter = router({
  createLike: standardAuthedProcedure.input(createLikeInputSchema).mutation<Like>(({ ctx, input }) =>
    ctx.db.transaction(async (tx) => {
      const [post, existingLike] = await Promise.all([
        readLikedPost(tx, input.postId),
        tx.query.likes.findFirst({
          where: {
            postId: {
              eq: input.postId,
            },
            userId: {
              eq: ctx.getSessionPayload.user.id,
            },
          },
        }),
      ]);
      if (!post) throw getNotFoundError(DatabaseEntityType.Post, input.postId);
      // A like already exists for this (user, post) — the client desynced (double-click / stale feed);
      // Fail cleanly instead of surfacing the raw likes_pkey duplicate-key error as a 500
      else if (existingLike)
        throw getInvalidOperationError(Operation.Create, DatabaseEntityType.Like, JSON.stringify(input));

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
      await updateLikeCount(tx, post, post.likeCount + newLike.value);
      return newLike;
    }),
  ),
  deleteLike: standardAuthedProcedure.input(deleteLikeInputSchema).mutation<Like>(({ ctx, input }) =>
    ctx.db.transaction(async (tx) => {
      const post = await requireEntity(readLikedPost(tx, input), DatabaseEntityType.Post, input);
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
      await updateLikeCount(tx, post, post.likeCount - deletedLike.value);
      return deletedLike;
    }),
  ),
  updateLike: standardAuthedProcedure.input(updateLikeInputSchema).mutation<Like>(({ ctx, input: { postId, value } }) =>
    ctx.db.transaction(async (tx) => {
      const [post, existingLike] = await Promise.all([
        readLikedPost(tx, postId),
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
      if (!post) throw getNotFoundError(DatabaseEntityType.Post, postId);
      else if (!existingLike) throw getNotFoundError(DatabaseEntityType.Like, postId);
      else if (existingLike.value === value)
        throw getInvalidOperationError(Operation.Update, DatabaseEntityType.Like, JSON.stringify({ postId, value }));

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
      await updateLikeCount(tx, post, post.likeCount + value * 2);
      return updatedLike;
    }),
  ),
});
