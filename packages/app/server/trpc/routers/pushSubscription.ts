import { pushSubscriptionSchema } from "@@/server/models/pushSubscription/PushSubscription";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { DatabaseEntityType, pushSubscriptionsInMessage } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
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
      const newPushSubscription = requireMutation(
        (
          await ctx.db
            .insert(pushSubscriptionsInMessage)
            .values({
              auth,
              endpoint,
              expirationTime: expirationTime ? new Date(expirationTime) : null,
              p256dh,
              userId: ctx.getSessionPayload.user.id,
            })
            .onConflictDoUpdate({
              set: {
                auth,
                expirationTime: expirationTime ? new Date(expirationTime) : null,
                p256dh,
              },
              target: [pushSubscriptionsInMessage.endpoint, pushSubscriptionsInMessage.userId],
            })
            .returning()
        )[0],
        Operation.Create,
        DatabaseEntityType.PushSubscription,
        pushSubscriptionRouter.subscribe.name,
      );
      return newPushSubscription;
    },
  ),
  unsubscribe: standardAuthedProcedure.input(pushSubscriptionSchema.shape.endpoint).mutation(async ({ ctx, input }) => {
    const deletedPushSubscription = requireMutation(
      (
        await ctx.db
          .delete(pushSubscriptionsInMessage)
          .where(
            and(
              eq(pushSubscriptionsInMessage.endpoint, input),
              eq(pushSubscriptionsInMessage.userId, ctx.getSessionPayload.user.id),
            ),
          )
          .returning()
      )[0],
      Operation.Delete,
      DatabaseEntityType.PushSubscription,
      pushSubscriptionRouter.unsubscribe.name,
    );
    return deletedPushSubscription;
  }),
});
