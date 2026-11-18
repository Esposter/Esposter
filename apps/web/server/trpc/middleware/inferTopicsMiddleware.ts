import { publishTopicsBestEffort } from "#server/services/realtime/publishTopicsBestEffort";
import { t } from "#server/trpc/initTrpc";
import { TOPICS_HEADER } from "#shared/services/realtime/constants";
import { formatTopicsHeaderValue } from "#shared/services/realtime/formatTopicsHeaderValue";
import { getReadTopics, getWriteTopics, recordStatements } from "@esposter/db";

// The live topics of every procedure that does not declare them, from the statements it awaits (the live queries design).
// A query's topics are what its answer was read from, sent back on its response. The writes a procedure makes, a query's
// Included, are published best-effort once it resolves. A procedure that declares its topics by hand keeps its
// Declaration, and one that declares a static reason is watched by no topic at all
export const inferTopicsMiddleware = t.middleware(async ({ ctx, meta, next, path, type }) => {
  if (type === "subscription" || meta?.topics !== undefined || meta?.staticReason !== undefined) return next();

  // Taken before the read runs, so a publish that lands after it reaches the watch even when the answer misses it
  const readAt = Date.now();
  const recorded = recordStatements(ctx.db);
  const result = await next({ ctx: { db: recorded.database } });
  if (!result.ok) return result;

  // A query's topics travel back with its answer, so the client watches what the read it rendered came from
  if (type === "query") {
    const topics = await getReadTopics(recorded.statements);
    if (topics.length > 0) ctx.responseHeaders.append(TOPICS_HEADER, formatTopicsHeaderValue(path, { readAt, topics }));
  }
  // A write is published whichever procedure makes it, since a query may delete the rows it reads (a lapsed invite)
  await publishTopicsBestEffort(
    () => getWriteTopics(recorded.statements),
    `Failed to publish the topics of "${path}":`,
  );
  return result;
});
