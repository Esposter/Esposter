import type { RecordedUnit } from "#src/models/shared/RecordedUnit";

import { getCoreDatabase } from "#src/services/shared/getCoreDatabase";
import { unitStorage } from "#src/services/shared/unitStorage";
import { getWriteTopics, recordStatements, runRecordedWrites } from "@esposter/db";
import { env } from "cloudflare:workers";

// Runs one unit of work, a queue message or the nightly purge, with its writes and its blob writes recorded. The topics those
// Writes name are published best-effort once it settles, whether it succeeded or not: a write that landed before a failure
// Still changed rows
export const runUnit = <T>(run: () => Promise<T>): Promise<T> => {
  const unit: RecordedUnit = { ...recordStatements(getCoreDatabase()), blobs: { reads: [], writes: [] } };
  return runRecordedWrites(unitStorage, unit, run, {
    failure: "Failed to publish the topics of a job's writes:",
    readTopics: async () => [
      ...(await getWriteTopics(unit.statements)),
      ...unit.blobs.writes.map((topic) => ({ topic })),
    ],
    topicNamespace: env.TOPIC,
  });
};
