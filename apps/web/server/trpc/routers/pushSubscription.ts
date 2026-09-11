import type { PushSubscription } from "@esposter/db-schema";

import { pushSubscriptionInputSchema } from "#shared/models/db/pushSubscription/PushSubscriptionInput";
import { router } from "@@/server/trpc";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType, pushSubscriptions } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { and, eq } from "drizzle-orm";

export const pushSubscriptionRouter = router({
  subscribe: standardAuthedProcedure.input(pushSubscriptionInputSchema).mutation<PushSubscription>(
    async ({
      ctx,
      input: {
        endpoint,
        expirationTime,
        keys: { auth, p256dh },
      },
    }) =>
      requireMutation(
        (
          await ctx.db
            .insert(pushSubscriptions)
            .values({
              auth,
              endpoint,
              expirationTime: expirationTime ? new Date(expirationTime) : null,
              p256dh,
              sessionId: ctx.getSessionPayload.session.id,
              userId: ctx.getSessionPayload.user.id,
            })
            .onConflictDoUpdate({
              set: {
                auth,
                expirationTime: expirationTime ? new Date(expirationTime) : null,
                p256dh,
                // The same browser resubscribing under a new session claims the row for it, so a revoke of the
                // Session that is actually using this endpoint is the one that takes its pushes away
                sessionId: ctx.getSessionPayload.session.id,
              },
              target: [pushSubscriptions.endpoint, pushSubscriptions.userId],
            })
            .returning()
        )[0],
        Operation.Create,
        DatabaseEntityType.PushSubscription,
        "subscribe",
      ),
  ),
  unsubscribe: standardAuthedProcedure
    .input(pushSubscriptionInputSchema.shape.endpoint)
    .mutation<PushSubscription>(async ({ ctx, input }) =>
      requireMutation(
        (
          await ctx.db
            .delete(pushSubscriptions)
            .where(
              and(eq(pushSubscriptions.endpoint, input), eq(pushSubscriptions.userId, ctx.getSessionPayload.user.id)),
            )
            .returning()
        )[0],
        Operation.Delete,
        DatabaseEntityType.PushSubscription,
        "unsubscribe",
      ),
    ),
});
