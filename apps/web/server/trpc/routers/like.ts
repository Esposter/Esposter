import type { LikeInPost } from "@esposter/db-schema";

import { getLikeWhere, getLiveLikeWhere } from "#server/services/post/getLikeWhere";
import { readLike } from "#server/services/post/readLike";
import { readLikedPost } from "#server/services/post/readLikedPost";
import { updateLikeRanking } from "#server/services/post/updateLikeRanking";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { router } from "#server/trpc/index";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { createLikeInputSchema } from "#shared/models/db/post/CreateLikeInput";
import { deleteLikeInputSchema } from "#shared/models/db/post/DeleteLikeInput";
import { updateLikeInputSchema } from "#shared/models/db/post/UpdateLikeInput";
import { DatabaseEntityType, likesInPost, postsInPost } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { and, eq, exists, isNotNull, not, sql } from "drizzle-orm";

// Each vote is one batch: the like's row and the count it moves commit together or not at all, and the ranking
// Follows in its own write once the count it was computed from is known (`updateLikeRanking`)
export const likeRouter = router({
  createLike: standardAuthedProcedure.input(createLikeInputSchema).mutation<LikeInPost>(async ({ ctx, input }) => {
    const post = await requireEntity(readLikedPost(ctx.db, input.postId), DatabaseEntityType.Post, input.postId);
    const userId = ctx.user.id;
    // The count moves only while no live vote of the member stands, and the vote is written in the same batch. A vote
    // that stands refuses both writes, and a removed one is revived by the upsert, whose conflict branch clears deletedAt
    // at the next version. A refusal leaves the batch with no row, which is the same refusal a duplicate has always been
    const [updatedPostRows, newLikeRows] = await ctx.db.batch([
      ctx.db
        .update(postsInPost)
        .set({ likeCount: sql`${postsInPost.likeCount} + ${input.value}` })
        .where(
          and(
            eq(postsInPost.id, input.postId),
            not(
              exists(
                ctx.db
                  .select({ _: sql`1` })
                  .from(likesInPost)
                  .where(getLiveLikeWhere(input.postId, userId)),
              ),
            ),
          ),
        )
        .returning(),
      ctx.db
        .insert(likesInPost)
        .values({ ...input, userId })
        .onConflictDoUpdate({
          set: { deletedAt: null, value: input.value },
          setWhere: isNotNull(likesInPost.deletedAt),
          target: [likesInPost.userId, likesInPost.postId],
        })
        .returning(),
    ]);
    const newLike = requireMutation(newLikeRows[0], Operation.Create, DatabaseEntityType.Like, JSON.stringify(input));
    await updateLikeRanking(
      ctx.db,
      post,
      requireMutation(updatedPostRows[0], Operation.Update, DatabaseEntityType.Post, input.postId).likeCount,
    );
    return newLike;
  }),
  deleteLike: standardAuthedProcedure.input(deleteLikeInputSchema).mutation<LikeInPost>(async ({ ctx, input }) => {
    const userId = ctx.user.id;
    const post = await requireEntity(readLikedPost(ctx.db, input), DatabaseEntityType.Post, input);
    const existingLike = requireMutation(
      await readLike(ctx.db, input, userId),
      Operation.Delete,
      DatabaseEntityType.Like,
      input,
    );
    // The count moves and the like is removed only while the like still holds the value the count is moved by, so a
    // Change landing between the read above and this batch refuses both writes together. The removal is a tombstone
    // At the version it leaves, which is the row the client's removal is ordered against
    const [updatedPostRows, removedLikeRows] = await ctx.db.batch([
      ctx.db
        .update(postsInPost)
        .set({ likeCount: sql`${postsInPost.likeCount} - ${existingLike.value}` })
        .where(
          and(
            eq(postsInPost.id, input),
            exists(
              ctx.db
                .select({ _: sql`1` })
                .from(likesInPost)
                .where(getLikeWhere(input, userId, existingLike.value)),
            ),
          ),
        )
        .returning(),
      ctx.db
        .update(likesInPost)
        .set({ deletedAt: new Date() })
        .where(getLikeWhere(input, userId, existingLike.value))
        .returning(),
    ]);
    const removedLike = requireMutation(removedLikeRows[0], Operation.Delete, DatabaseEntityType.Like, input);
    await updateLikeRanking(
      ctx.db,
      post,
      requireMutation(updatedPostRows[0], Operation.Update, DatabaseEntityType.Post, input).likeCount,
    );
    return removedLike;
  }),
  updateLike: standardAuthedProcedure
    .input(updateLikeInputSchema)
    .mutation<LikeInPost>(async ({ ctx, input: { postId, value } }) => {
      const userId = ctx.user.id;
      const [post, existingLike] = await Promise.all([readLikedPost(ctx.db, postId), readLike(ctx.db, postId, userId)]);
      if (!post) throw getNotFoundError(DatabaseEntityType.Post, postId);
      else if (!existingLike) throw getNotFoundError(DatabaseEntityType.Like, postId);
      else if (existingLike.value === value)
        throw getInvalidOperationError(Operation.Update, DatabaseEntityType.Like, JSON.stringify({ postId, value }));

      // The count moves by the change and the like takes the new value, only while the like still holds the value it
      // Is changed from; the count is written first, so its guard reads the like before the change lands
      const [updatedPostRows, updatedLikeRows] = await ctx.db.batch([
        ctx.db
          .update(postsInPost)
          .set({ likeCount: sql`${postsInPost.likeCount} + ${value - existingLike.value}` })
          .where(
            and(
              eq(postsInPost.id, postId),
              exists(
                ctx.db
                  .select({ _: sql`1` })
                  .from(likesInPost)
                  .where(getLikeWhere(postId, userId, existingLike.value)),
              ),
            ),
          )
          .returning(),
        ctx.db
          .update(likesInPost)
          .set({ value })
          .where(getLikeWhere(postId, userId, existingLike.value))
          .returning(),
      ]);
      const updatedLike = requireMutation(
        updatedLikeRows[0],
        Operation.Update,
        DatabaseEntityType.Like,
        JSON.stringify({ postId, value }),
      );
      await updateLikeRanking(
        ctx.db,
        post,
        requireMutation(updatedPostRows[0], Operation.Update, DatabaseEntityType.Post, postId).likeCount,
      );
      return updatedLike;
    }),
});
