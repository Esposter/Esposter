import type { RecordedBlobs } from "@esposter/db";
import type { Database } from "@esposter/db-schema";

import { publishTopicsBestEffort } from "#src/services/realtime/publishTopicsBestEffort";
import { getWriteTopics, recordStatements } from "@esposter/db";
import { relations } from "@esposter/db-schema";
import { withFinalizerAsync } from "@esposter/shared";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import { AsyncLocalStorage } from "node:async_hooks";

type RecordedUnit = ReturnType<typeof recordStatements> & { blobs: RecordedBlobs };

const unitStorage = new AsyncLocalStorage<RecordedUnit>();

// Built on first use rather than when this module loads: the binding is read when a job runs, and a test installs it after
// The modules that import this one have loaded
let coreDatabase: Database | undefined;
const getCoreDatabase = (): Database => (coreDatabase ??= drizzle(env.CORE, { relations }));

// The handle a job's statements run through. Inside a unit of work it is the unit's recorded handle, so the unit's writes
// Are named when it settles; outside one it is the D1 handle itself
export const getDb = (): Database => unitStorage.getStore()?.database ?? getCoreDatabase();

// The blobs a unit of work reads and writes, which a bucket binding records into while the unit runs, and nothing outside one
export const getUnitBlobs = (): RecordedBlobs | undefined => unitStorage.getStore()?.blobs;

// Runs one unit of work, a queue message or the nightly purge, with its writes and its blob writes recorded. The topics those
// Writes name are published best-effort once it settles, whether it succeeded or not: a write that landed before a failure
// Still changed rows
export const runUnit = <T>(run: () => Promise<T>): Promise<T> => {
  const unit: RecordedUnit = { ...recordStatements(getCoreDatabase()), blobs: { reads: [], writes: [] } };
  return withFinalizerAsync(
    () => unitStorage.run(unit, run),
    () =>
      publishTopicsBestEffort(
        async () => [...(await getWriteTopics(unit.statements)), ...unit.blobs.writes],
        "Failed to publish the topics of a job's writes:",
      ),
  );
};
