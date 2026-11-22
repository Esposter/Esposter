import type { Context } from "#server/trpc/context";
import type { SQL } from "drizzle-orm";

import { appUsersInMessage, getLiveRowWhere, webhooksInMessage } from "@esposter/db-schema";
import { and, inArray } from "drizzle-orm";

// The app users the live webhooks matching the filter post as, tombstoned as one statement. A webhook names
// Its app user, so a caller batches this ahead of the webhook's own tombstone, while it is still live to name the user
export const getWebhookAppUserTombstone = (db: Context["db"], webhookWhere: SQL | undefined) =>
  db
    .update(appUsersInMessage)
    .set({ deletedAt: new Date() })
    .where(
      inArray(
        appUsersInMessage.id,
        db
          .select({ userId: webhooksInMessage.userId })
          .from(webhooksInMessage)
          .where(and(webhookWhere, getLiveRowWhere(webhooksInMessage))),
      ),
    );
