import type { WriteResourceActivityInput } from "@@/server/models/resource/WriteResourceActivityInput";
import type { Clause } from "@esposter/azure";
import type { ResourceActivityEntity as BaseResourceActivityEntity } from "@esposter/db-schema";

import { ItemMetadataPropertyNames } from "#shared/models/entity/ItemMetadataPropertyNames";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { CONTENT_SAVED_COALESCE_WINDOW_MS } from "@@/server/services/resource/constants";
import { BinaryOperator, CompositeKeyPropertyNames, serializeClauses } from "@esposter/azure";
import { createEntity, getTopNEntities } from "@esposter/db";
import {
  AzureTable,
  getReverseTickedTimestamp,
  ResourceActivityEntity,
  ResourceActivityEntityPropertyNames,
  ResourceActivityType,
} from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// Emitted after the primary write, where a failure costs one trail entry and never the user's mutation
export const writeResourceActivity = ({ resourceId, ...rest }: WriteResourceActivityInput) =>
  getResultAsync(async () => {
    const resourceActivityClient = await useTableClient(AzureTable.ResourceActivity);
    if (rest.activityType === ResourceActivityType.ContentSaved) {
      // Coalesce on existence rather than on the partition head, so the answer does not depend on the order
      // Entities come back in. Two saves racing inside the window both read empty and both write, which costs the
      // Trail one extra line — the alternative is a deterministic rowKey, and the rowKey is what orders the trail
      const clauses: Clause<BaseResourceActivityEntity>[] = [
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: resourceId },
        {
          key: ResourceActivityEntityPropertyNames.activityType,
          operator: BinaryOperator.Eq,
          value: ResourceActivityType.ContentSaved,
        },
        { key: ResourceActivityEntityPropertyNames.userId, operator: BinaryOperator.Eq, value: rest.userId },
        {
          key: ItemMetadataPropertyNames.createdAt,
          operator: BinaryOperator.Gt,
          value: new Date(Date.now() - CONTENT_SAVED_COALESCE_WINDOW_MS),
        },
      ];
      const recentEntries = await getTopNEntities(resourceActivityClient, 1, ResourceActivityEntity, {
        filter: serializeClauses(clauses),
      });
      if (recentEntries.length > 0) return;
    }

    await createEntity(
      resourceActivityClient,
      new ResourceActivityEntity({ ...rest, partitionKey: resourceId, rowKey: getReverseTickedTimestamp() }),
    );
  }).match(noop, console.error);
