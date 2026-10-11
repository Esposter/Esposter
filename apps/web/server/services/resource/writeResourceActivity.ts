import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { WriteResourceActivityInput } from "#server/models/resource/WriteResourceActivityInput";
import type { Clause } from "@esposter/azure";
import type { ResourceActivityEntity as BaseResourceActivityEntity } from "@esposter/db-schema";

import { useTableClient } from "#server/composables/azure/table/useTableClient";
import { CONTENT_SAVED_COALESCE_WINDOW_MS } from "#server/services/resource/constants";
import { ItemMetadataPropertyNames } from "#shared/models/entity/ItemMetadataPropertyNames";
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

// Emitted after the primary write, where a failure costs one trail entry and never the user's mutation. The writer is
// The context's user, and the key an agent came through or "" for the owner's own hand
export const writeResourceActivity = (ctx: AuthedContext, { resourceId, ...rest }: WriteResourceActivityInput) =>
  getResultAsync(async () => {
    const userId = ctx.getSessionPayload.user.id;
    const apiKeyId = ctx.apiKey?.id ?? "";
    const resourceActivityClient = await useTableClient(AzureTable.ResourceActivity);
    if (rest.activityType === ResourceActivityType.ContentSaved) {
      // Coalesce on existence rather than on the partition head, so the answer does not depend on the order
      // Entities come back in. Two saves racing inside the window both read empty and both write, which costs the
      // Trail one extra line — the alternative is a deterministic rowKey, and the rowKey is what orders the trail.
      // Per key as well as per user, so an agent's run of saves and a stretch of the owner's typing stay apart
      const clauses: Clause<BaseResourceActivityEntity>[] = [
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: resourceId },
        {
          key: ResourceActivityEntityPropertyNames.activityType,
          operator: BinaryOperator.Eq,
          value: ResourceActivityType.ContentSaved,
        },
        { key: ResourceActivityEntityPropertyNames.userId, operator: BinaryOperator.Eq, value: userId },
        { key: ResourceActivityEntityPropertyNames.apiKeyId, operator: BinaryOperator.Eq, value: apiKeyId },
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
      new ResourceActivityEntity({
        ...rest,
        apiKeyId,
        apiKeyName: ctx.apiKey?.name ?? "",
        partitionKey: resourceId,
        rowKey: getReverseTickedTimestamp(),
        userId,
      }),
    );
  }).match(noop, console.error);
