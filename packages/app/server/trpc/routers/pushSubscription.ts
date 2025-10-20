import { pushSubscriptionSchema } from "@@/server/models/PushSubscription";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType, pushSubscriptions } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

export const pushSubscriptionRouter = router({
  subscribe: standardAuthedProcedure.input(pushSubscriptionSchema).mutation(
    async ({
      ctx,
      input: {
        endpoint,
        expirationTime,
        keys: { auth, p256dh },
      },
    }) => {
      const newPushSubscription = (
        await ctx.db
          .insert(pushSubscriptions)
          .values({
            auth,
            endpoint,
            expirationTime: expirationTime ? new Date(expirationTime) : null,
            p256dh,
            userId: ctx.session.user.id,
          })
          .onConflictDoUpdate({
            set: {
              auth,
              expirationTime: expirationTime ? new Date(expirationTime) : null,
              p256dh,
            },
            target: [pushSubscriptions.endpoint, pushSubscriptions.userId],
          })
          .returning()
      ).find(Boolean);
      if (!newPushSubscription)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(
            Operation.Create,
            DatabaseEntityType.PushSubscription,
            pushSubscriptionRouter.subscribe.name,
          ).message,
        });
      return newPushSubscription;
    },
  ),
  unsubscribe: standardAuthedProcedure.input(pushSubscriptionSchema.shape.endpoint).mutation(async ({ ctx, input }) => {
    const deletedPushSubscription = (
      await ctx.db
        .delete(pushSubscriptions)
        .where(and(eq(pushSubscriptions.endpoint, input), eq(pushSubscriptions.userId, ctx.session.user.id)))
        .returning()
    ).find(Boolean);
    if (!deletedPushSubscription)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(
          Operation.Delete,
          DatabaseEntityType.PushSubscription,
          pushSubscriptionRouter.unsubscribe.name,
        ).message,
      });
    return deletedPushSubscription;
  }),
});
