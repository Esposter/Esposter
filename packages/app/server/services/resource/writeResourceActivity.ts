import type { WriteResourceActivityInput } from "@@/server/models/resource/WriteResourceActivityInput";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { CONTENT_SAVED_COALESCE_WINDOW_MS } from "@@/server/services/resource/constants";
import { createEntity, getTopNEntities, serializeClauses } from "@esposter/db";
import {
  AzureTable,
  BinaryOperator,
  CompositeKeyPropertyNames,
  getReverseTickedTimestamp,
  ResourceActivityEntity,
  ResourceActivityType,
} from "@esposter/db-schema";
import { getResultAsync, noop, takeOne } from "@esposter/shared";

// Emitted after the primary write, best-effort: the resource is already saved, so a failed
// Activity write logs and never fails the user's mutation.
export const writeResourceActivity = ({ resourceId, ...rest }: WriteResourceActivityInput) =>
  getResultAsync(async () => {
    const resourceActivityClient = await useTableClient(AzureTable.ResourceActivity);
    if (rest.activityType === ResourceActivityType.ContentSaved) {
      // Newest-first rowKey means the head of the partition is the last thing that happened
      const entries = await getTopNEntities(resourceActivityClient, 1, ResourceActivityEntity, {
        filter: serializeClauses([
          { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: resourceId },
        ]),
      });
      const latestEntry = entries.length > 0 ? takeOne(entries) : undefined;
      if (
        latestEntry?.activityType === ResourceActivityType.ContentSaved &&
        latestEntry.userId === rest.userId &&
        Date.now() - new Date(latestEntry.createdAt).getTime() < CONTENT_SAVED_COALESCE_WINDOW_MS
      )
        return;
    }

    await createEntity(
      resourceActivityClient,
      new ResourceActivityEntity({ ...rest, partitionKey: resourceId, rowKey: getReverseTickedTimestamp() }),
    );
  }).match(noop, console.error);
