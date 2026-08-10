import type { Database } from "@esposter/db-schema";

import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { DatabaseEntityType } from "@esposter/db-schema";

// Both users are read rather than rebuilt from the session: the session carries better-auth's own view of the user,
// Which is a subset of the row — a payload assembled from it can only be completed by inventing values for the
// Columns it does not carry. Neither read depends on the other, so they go out together. Resolved as a guard, so a
// User that does not exist fails before anything is written
export const readUserPair = (db: Database, userIdA: string, userIdB: string) =>
  Promise.all([
    requireEntity(db.query.users.findFirst({ where: { id: { eq: userIdA } } }), DatabaseEntityType.User, userIdA),
    requireEntity(db.query.users.findFirst({ where: { id: { eq: userIdB } } }), DatabaseEntityType.User, userIdB),
  ]);
