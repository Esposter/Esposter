import type { RecordedBlobs } from "@esposter/db";
import type { ColumnTopic } from "@esposter/db-schema";

import { requestDbStorage } from "#server/db/requestDb";
import { publishTopicsBestEffort } from "#server/services/realtime/publishTopicsBestEffort";
import { requestObjectReadsStorage } from "#server/services/realtime/requestObjectReads";
import { requestBlobsStorage } from "#server/services/storage/requestBlobs";
import { t } from "#server/trpc/initTrpc";
import { TOPICS_HEADER } from "#shared/services/realtime/constants";
import { formatTopicsHeaderValue } from "#shared/services/realtime/formatTopicsHeaderValue";
import { getReadTopics, getWriteTopics, recordStatements } from "@esposter/db";
import { mergeColumnTopics } from "@esposter/db-schema";

// The live topics of every procedure that does not declare them, from the statements it awaits, the blobs its buckets read
// Or write, and the read sets its objects report (the live queries design). A query's topics are what its answer was read from, sent back on its response. The writes
// A procedure makes, a query's included, are published best-effort once it resolves. A procedure that declares its topics by
// Hand keeps its declaration, and one that declares a static reason is watched by no topic at all
export const inferTopicsMiddleware = t.middleware(async ({ ctx, meta, next, path, type }) => {
  if (type === "subscription" || meta?.topics !== undefined || meta?.staticReason !== undefined) return next();

  // Taken before the read runs, so a publish that lands after it reaches the watch even when the answer misses it
  const readAt = Date.now();
  const recorded = recordStatements(ctx.db);
  const blobs: RecordedBlobs = { reads: [], writes: [] };
  const objectReads: ColumnTopic[] = [];
  // The request's handle and its blobs are in scope for the whole procedure, so a write the auth instance makes (a session
  // Revoke) and a blob a bucket reads or writes are recorded too
  const result = await requestDbStorage.run(recorded.database, () =>
    requestBlobsStorage.run(blobs, () =>
      requestObjectReadsStorage.run(objectReads, () => next({ ctx: { db: recorded.database } })),
    ),
  );
  // A query's topics travel back with its answer, so the client watches what the read it rendered came from
  if (type === "query" && result.ok) {
    const topics = mergeColumnTopics([
      ...(await getReadTopics(recorded.statements)),
      ...blobs.reads.map((topic) => ({ topic })),
      ...objectReads,
    ]);
    if (topics.length > 0) ctx.responseHeaders.append(TOPICS_HEADER, formatTopicsHeaderValue(path, { readAt, topics }));
  }
  // A write is published whichever procedure makes it and however it ends, since a query may delete the rows it reads (a
  // Lapsed invite) and a write may land before the procedure fails. A published topic only wakes a reader to refetch
  await publishTopicsBestEffort(
    async () => [...(await getWriteTopics(recorded.statements)), ...blobs.writes.map((topic) => ({ topic }))],
    `Failed to publish the topics of "${path}":`,
  );
  return result;
});
