import type { WriteResourceActivityInput } from "@@/server/models/resource/WriteResourceActivityInput";
import type { Clause } from "@esposter/azure";
import type { ResourceActivityEntity as AResourceActivityEntity } from "@esposter/db-schema";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { CONTENT_SAVED_COALESCE_WINDOW_MS } from "@@/server/services/resource/constants";
import { BinaryOperator, CompositeKeyPropertyNames } from "@esposter/azure";
import { createEntity, getTopNEntities, serializeClauses } from "@esposter/db";
import {
  AzureTable,
  getReverseTickedTimestamp,
  ResourceActivityEntity,
  ResourceActivityEntityPropertyNames,
  ResourceActivityType,
} from "@esposter/db-schema";
import { getResultAsync, ItemMetadataPropertyNames, noop } from "@esposter/shared";

// Emitted after the primary write, best-effort: the resource is already saved, so a failed
// Activity write logs and never fails the user's mutation.
export const writeResourceActivity = ({ resourceId, ...rest }: WriteResourceActivityInput) =>
  getResultAsync(async () => {
    const resourceActivityClient = await useTableClient(AzureTable.ResourceActivity);
    if (rest.activityType === ResourceActivityType.ContentSaved) {
      // Coalesce on existence rather than on the partition head: "this user already has a
      // ContentSaved inside the window" is the flood the window exists to stop, and asking the
      // Question this way makes the answer independent of the order entities come back in.
      const recentEntries = await getTopNEntities(resourceActivityClient, 1, ResourceActivityEntity, {
        filter: serializeClauses([
          { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: resourceId },
          {
            key: ResourceActivityEntityPropertyNames.activityType,
            operator: BinaryOperator.eq,
            value: ResourceActivityType.ContentSaved,
          },
          { key: ResourceActivityEntityPropertyNames.userId, operator: BinaryOperator.eq, value: rest.userId },
          {
            key: ItemMetadataPropertyNames.createdAt,
            operator: BinaryOperator.gt,
            value: new Date(Date.now() - CONTENT_SAVED_COALESCE_WINDOW_MS),
          },
        ] as Clause<AResourceActivityEntity>[]),
      });
      if (recentEntries.length > 0) return;
    }

    await createEntity(
      resourceActivityClient,
      new ResourceActivityEntity({ ...rest, partitionKey: resourceId, rowKey: getReverseTickedTimestamp() }),
    );
  }).match(noop, console.error);
