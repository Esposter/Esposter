import type { PushSubscriptionInNotification } from "@esposter/db-schema";

import { pushSubscriptionInputSchema } from "#shared/models/db/pushSubscription/PushSubscriptionInput";
import { router } from "@@/server/trpc";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType, pushSubscriptionsInNotification } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { and, eq } from "drizzle-orm";

export const pushSubscriptionRouter = router({
  subscribe: standardAuthedProcedure.input(pushSubscriptionInputSchema).mutation<PushSubscriptionInNotification>(
    async ({
      ctx,
      input: {
        endpoint,
        expirationTime,
        keys: { auth, p256dh },
      },
    }) => {
      const { session, user } = ctx.getSessionPayload;
      const expiresAt = expirationTime ? new Date(expirationTime) : null;
      return requireMutation(
        (
          await ctx.db
            .insert(pushSubscriptionsInNotification)
            .values({ auth, endpoint, expirationTime: expiresAt, p256dh, sessionId: session.id, userId: user.id })
            .onConflictDoUpdate({
              set: {
                auth,
                expirationTime: expiresAt,
                p256dh,
                // The same browser resubscribing under a new session claims the row for it, so a revoke of the
                // Session that is actually using this endpoint is the one that takes its pushes away
                sessionId: session.id,
              },
              target: [pushSubscriptionsInNotification.endpoint, pushSubscriptionsInNotification.userId],
            })
            .returning()
        )[0],
        Operation.Create,
        DatabaseEntityType.PushSubscription,
        "subscribe",
      );
    },
  ),
  unsubscribe: standardAuthedProcedure
    .input(pushSubscriptionInputSchema.shape.endpoint)
    .mutation<PushSubscriptionInNotification>(async ({ ctx, input }) =>
      requireMutation(
        (
          await ctx.db
            .delete(pushSubscriptionsInNotification)
            .where(
              and(
                eq(pushSubscriptionsInNotification.endpoint, input),
                eq(pushSubscriptionsInNotification.userId, ctx.getSessionPayload.user.id),
              ),
            )
            .returning()
        )[0],
        Operation.Delete,
        DatabaseEntityType.PushSubscription,
        "unsubscribe",
      ),
    ),
});
