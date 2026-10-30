import type { Database, UserInAuth } from "@esposter/db-schema";

import { usersInAuth } from "@esposter/db-schema";
import { eq, sql } from "drizzle-orm";

// The one write that moves a user's `storageBytesUsed`, for a reconcile and a release alike.
// It clamps at zero, since drift can only ever be corrected downwards.
// A negative total would read back as more allowance than the tier grants
export const adjustStorageBytesUsed = async (
  db: Database,
  userId: UserInAuth["id"],
  deltaBytes: number,
): Promise<void> => {
  await db
    .update(usersInAuth)
    .set({ storageBytesUsed: sql`GREATEST(0, ${usersInAuth.storageBytesUsed} + ${deltaBytes})` })
    .where(eq(usersInAuth.id, userId));
};
