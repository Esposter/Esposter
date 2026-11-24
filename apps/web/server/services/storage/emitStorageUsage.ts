import type { Database, UserInAuth } from "@esposter/db-schema";

import { callUserObjects } from "#server/services/realtime/callUserObjects";
import { getResultAsync, noop } from "@esposter/shared";

// Best-effort by construction, and it has to be: everything this announces is already durable by the time it
// Runs, so a failed read here must never turn a committed charge or release into a call that reports failure.
// What it costs when it does fail is a meter left on its previous number until the next event or the next
// Read — the counter itself is right either way, since this only reports it.
// A caller whose write has just returned the owner's row passes it, which is the row a read here would answer.
export const emitStorageUsage = (db: Database, userId: UserInAuth["id"], writtenUser?: UserInAuth): Promise<void> =>
  getResultAsync(async () => {
    const user = writtenUser ?? (await db.query.usersInAuth.findFirst({ where: { id: { eq: userId } } }));
    if (!user) return;

    await callUserObjects([userId], (userObject) => userObject.updateUsage(user));
  }).match(noop, console.error);
