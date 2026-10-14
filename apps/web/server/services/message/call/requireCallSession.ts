import type { Context } from "#server/trpc/context";

import { requireEntity } from "#server/trpc/guards/requireEntity";
import { DatabaseEntityType } from "@esposter/db-schema";

export const requireCallSession = (db: Context["db"], callSessionId: string) =>
  requireEntity(
    db.query.callSessionsInMessage.findFirst({ where: { id: { eq: callSessionId } } }),
    DatabaseEntityType.CallSession,
    callSessionId,
  );
