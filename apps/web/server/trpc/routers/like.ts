import type { LikeInPost } from "@esposter/db-schema";

import { checkIsUniqueViolation } from "#server/services/db/checkIsUniqueViolation";
import { getLikeWhere } from "#server/services/post/getLikeWhere";
import { readLike } from "#server/services/post/readLike";
import { readLikedPost } from "#server/services/post/readLikedPost";
import { updateLikeRanking } from "#server/services/post/updateLikeRanking";
import { router } from "#server/trpc";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { createLikeInputSchema } from "#shared/models/db/post/CreateLikeInput";
import { deleteLikeInputSchema } from "#shared/models/db/post/DeleteLikeInput";
import { updateLikeInputSchema } from "#shared/models/db/post/UpdateLikeInput";
import { DatabaseEntityType, likesInPost, postsInPost } from "@esposter/db-schema";
import { getResultAsync, Operation } from "@esposter/shared";
import { and, eq, exists, sql } from "drizzle-orm";

// Each vote is one batch: the like's row and the count it moves commit together or not at all, and the ranking
// Follows in its own write once the count it was computed from is known (`updateLikeRanking`)
export const likeRouter = router({
  createLike: standardAuthedProcedure.input(createLikeInputSchema).mutation<LikeInPost>(async ({ ctx, input }) => {
    const post = await requireEntity(readLikedPost(ctx.db, input.postId), DatabaseEntityType.Post, input.postId);
    // The primary key on (post, user) refuses a second like of the same post, which fails the batch whole. Mapped to
    // The refusal a client desynced by a double-click or a stale feed has always been given, rather than a raw 500
    const [newLikeRows, updatedPostRows] = await getResultAsync(() =>
      ctx.db.batch([
        ctx.db
          .insert(likesInPost)
          .values({ ...input, userId: ctx.getSessionPayload.user.id })
          .returning(),
        ctx.db
          .update(postsInPost)
          .set({ likeCount: sql`${postsInPost.likeCount} + ${input.value}` })
          .where(eq(postsInPost.id, input.postId))
          .returning({ likeCount: postsInPost.likeCount }),
      ]),
    ).match(
      (results) => results,
      (error) => {
        if (checkIsUniqueViolation(error))
          throw getInvalidOperationError(Operation.Create, DatabaseEntityType.Like, JSON.stringify(input));
        throw error;
      },
    );
    const newLike = requireMutation(newLikeRows[0], Operation.Create, DatabaseEntityType.Like, JSON.stringify(input));
    await updateLikeRanking(
      ctx.db,
      post,
      requireMutation(updatedPostRows[0], Operation.Update, DatabaseEntityType.Post, input.postId).likeCount,
    );
    return newLike;
  }),
  deleteLike: standardAuthedProcedure.input(deleteLikeInputSchema).mutation<LikeInPost>(async ({ ctx, input }) => {
    const userId = ctx.getSessionPayload.user.id;
    const post = await requireEntity(readLikedPost(ctx.db, input), DatabaseEntityType.Post, input);
    const existingLike = requireMutation(
      await readLike(ctx.db, input, userId),
      Operation.Delete,
      DatabaseEntityType.Like,
      input,
    );
    // The count moves and the like goes only while the like still holds the value the count is moved by, so a change
    // Landing between the read above and this batch refuses both writes together
    const [updatedPostRows, deletedLikeRows] = await ctx.db.batch([
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
                .where(and(getLikeWhere(input, userId), eq(likesInPost.value, existingLike.value))),
            ),
          ),
        )
        .returning({ likeCount: postsInPost.likeCount }),
      ctx.db
        .delete(likesInPost)
        .where(and(getLikeWhere(input, userId), eq(likesInPost.value, existingLike.value)))
        .returning(),
    ]);
    const deletedLike = requireMutation(deletedLikeRows[0], Operation.Delete, DatabaseEntityType.Like, input);
    await updateLikeRanking(
      ctx.db,
      post,
      requireMutation(updatedPostRows[0], Operation.Update, DatabaseEntityType.Post, input).likeCount,
    );
    return deletedLike;
  }),
  updateLike: standardAuthedProcedure
    .input(updateLikeInputSchema)
    .mutation<LikeInPost>(async ({ ctx, input: { postId, value } }) => {
      const userId = ctx.getSessionPayload.user.id;
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
                  .where(and(getLikeWhere(postId, userId), eq(likesInPost.value, existingLike.value))),
              ),
            ),
          )
          .returning({ likeCount: postsInPost.likeCount }),
        ctx.db
          .update(likesInPost)
          .set({ value })
          .where(and(getLikeWhere(postId, userId), eq(likesInPost.value, existingLike.value)))
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
