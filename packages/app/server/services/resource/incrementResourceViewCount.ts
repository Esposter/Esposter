import type { Resource } from "@esposter/db-schema";

import { getUtcDateString } from "#shared/services/dayjs/getUtcDateString";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { MAX_VIEW_COUNT_ETAG_RETRIES } from "@@/server/services/resource/viewConstants";
import { createEntity, getEntity, updateEntity } from "@esposter/db";
import { AzureTable, ResourceViewEntity } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// Fire-and-forget telemetry: the read path must never fail or slow because of counting, so every
// Failure — including exhausting the ETag retries under concurrency — drops the count instead of throwing
export const incrementResourceViewCount = async (resourceId: Resource["id"]): Promise<void> => {
  await getResultAsync(async () => {
    const resourceViewClient = await useTableClient(AzureTable.ResourceViews);
    const rowKey = getUtcDateString(new Date());
    for (let attempt = 0; attempt < MAX_VIEW_COUNT_ETAG_RETRIES; attempt++) {
      const resourceView = await getEntity(resourceViewClient, ResourceViewEntity, resourceId, rowKey);
      if (!resourceView) {
        // Insert rather than upsert: two concurrent first views would both merge count: 1 and drop an
        // Increment, whereas the loser of an insert conflicts and re-reads into the increment path below
        const isCreated = await getResultAsync(() =>
          createEntity(resourceViewClient, new ResourceViewEntity({ count: 1, partitionKey: resourceId, rowKey })),
        ).match(
          () => true,
          () => false,
        );
        if (isCreated) return;
        continue;
      }

      resourceView.count++;
      const isUpdated = await getResultAsync(() => updateEntity(resourceViewClient, resourceView, "Merge")).match(
        () => true,
        // A concurrent increment already bumped the row, so re-read and try again
        () => false,
      );
      if (isUpdated) return;
    }
  }).match(noop, console.error);
};
