import type { RecordedBlobs } from "@esposter/db";
import type { ColumnTopic } from "@esposter/db-schema";

import { requestDbStorage } from "#server/db/requestDb";
import { createTopicWatchSignature } from "#server/services/realtime/createTopicWatchSignature";
import { publishTopicsBestEffort } from "#server/services/realtime/publishTopicsBestEffort";
import { requestObjectReadsStorage } from "#server/services/realtime/requestObjectReadsStorage";
import { requestBlobsStorage } from "#server/services/storage/requestBlobs";
import { t } from "#server/trpc/initTrpc";
import { ROW_VERSIONS_HEADER, TOPICS_HEADER } from "#shared/services/realtime/constants";
import { formatRowVersionHeaderValue } from "#shared/services/realtime/formatRowVersionHeaderValue";
import { formatTopicsHeaderValue } from "#shared/services/realtime/formatTopicsHeaderValue";
import { computeReadTopics, computeWriteTopics, getWriteRowVersions, recordStatements } from "@esposter/db";
import { fitTopicsBudget, MAX_READ_TOPICS, MAX_WRITE_ROW_VERSIONS } from "@esposter/db-schema";

// The live topics of every procedure, from the statements it awaits, the blobs its buckets read or write, and the read sets
// Its objects report (the live queries design). A query's topics are what its answer was read from, sent back on its response.
// The writes a procedure makes, a query's included, are published best-effort once it resolves. A procedure that declares a
// Static reason is watched by no topic at all
export const inferTopicsMiddleware = t.middleware(async ({ ctx, meta, next, path, type }) => {
  if (type === "subscription" || meta?.staticReason !== undefined) return next();

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
    // The one place a procedure's read topics merge, so the header's budget holds for every read however many lists or joins it has
    const topics = fitTopicsBudget(
      [...(await computeReadTopics(recorded.statements)), ...blobs.reads.map((topic) => ({ topic })), ...objectReads],
      MAX_READ_TOPICS,
    );
    // Signed for the person who read them, so a watch the object takes is one of the reads its person was given
    if (topics.length > 0)
      ctx.responseHeaders.append(
        TOPICS_HEADER,
        formatTopicsHeaderValue(path, {
          readAt,
          signature: createTopicWatchSignature(ctx.user?.id, { readAt, topics }),
          topics,
        }),
      );
  }
  // A mutation that succeeds names each row it changed by its key and the version the write left it at, so its answer settles
  // The entry the client made for that write at those versions. A write that changed more rows than MAX_WRITE_ROW_VERSIONS names
  // None of them, so the header never grows with a bulk write: its entry drops on the answer, and its rows come back through the
  // Topic refetch the publish below wakes. A failed mutation names none: its entry drops, and a write that landed before the failure
  // Is published below
  if (type === "mutation" && result.ok) {
    const rowVersions = getWriteRowVersions(recorded.statements);
    if (rowVersions.length <= MAX_WRITE_ROW_VERSIONS)
      for (const rowVersion of rowVersions)
        ctx.responseHeaders.append(ROW_VERSIONS_HEADER, formatRowVersionHeaderValue(path, rowVersion));
  }
  // A write is published whichever procedure makes it and however it ends, since a query may delete the rows it reads (a
  // Lapsed invite) and a write may land before the procedure fails. A published topic only wakes a reader to refetch
  await publishTopicsBestEffort(
    async () => [...(await computeWriteTopics(recorded.statements)), ...blobs.writes.map((topic) => ({ topic }))],
    `Failed to publish the topics of "${path}":`,
  );
  return result;
});
