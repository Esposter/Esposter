import type { Database } from "@esposter/db-schema";

import { publishTopicsBestEffort } from "#src/services/realtime/publishTopicsBestEffort";
import { getWriteTopics, recordStatements } from "@esposter/db";
import { relations } from "@esposter/db-schema";
import { withFinalizerAsync } from "@esposter/shared";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import { AsyncLocalStorage } from "node:async_hooks";

type RecordedUnit = ReturnType<typeof recordStatements>;

const unitStorage = new AsyncLocalStorage<RecordedUnit>();

// Built on first use rather than when this module loads: the binding is read when a job runs, and a test installs it after
// The modules that import this one have loaded
let coreDatabase: Database | undefined;
const getCoreDatabase = (): Database => (coreDatabase ??= drizzle(env.CORE, { relations }));

// The handle a job's statements run through. Inside a unit of work it is the unit's recorded handle, so the unit's writes
// Are named when it settles; outside one it is the D1 handle itself
export const getDb = (): Database => unitStorage.getStore()?.database ?? getCoreDatabase();

// Runs one unit of work, a queue message or the nightly purge, with its writes recorded. The topics those writes name are
// Published best-effort once it settles, whether it succeeded or not: a write that landed before a failure still changed rows
export const runUnit = <T>(run: () => Promise<T>): Promise<T> => {
  const unit = recordStatements(getCoreDatabase());
  return withFinalizerAsync(
    () => unitStorage.run(unit, run),
    () =>
      publishTopicsBestEffort(() => getWriteTopics(unit.statements), "Failed to publish the topics of a job's writes:"),
  );
};
