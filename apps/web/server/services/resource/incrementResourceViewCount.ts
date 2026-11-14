import type { ResourceInResource } from "@esposter/db-schema";

import { useStreamTableClient } from "#server/composables/streams/useStreamTableClient";
import { getUtcDateString } from "#shared/util/date/getUtcDateString";
import { StreamTable } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// One row per resource per UTC day, incremented in one statement, so every view counts exactly once. The read path
// must never fail or slow because of counting, so a failed increment is logged and that view is dropped
export const incrementResourceViewCount = async (resourceId: ResourceInResource["id"]): Promise<void> => {
  await getResultAsync(() =>
    useStreamTableClient(StreamTable.ResourceViews).increment(resourceId, getUtcDateString(new Date()), "count"),
  ).match(noop, console.error);
};
