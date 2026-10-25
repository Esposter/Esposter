import type { CompositeKeyEntity } from "#src/models/azure/table/CompositeKeyEntity";
import type { ReverseTickedTimestamp } from "#src/models/azure/table/ReverseTickedTimestamp";
import type { ResourceActivityType } from "#src/models/resource/ResourceActivityType";
import type { UserInAuth } from "#src/schema/auth/usersInAuth";
import type { ToData } from "@esposter/shared";

import { AzureEntity } from "#src/models/azure/table/AzureEntity";
import { reverseTickedTimestampSchema } from "#src/models/azure/table/ReverseTickedTimestamp";
import { resourceActivityTypeSchema } from "#src/models/resource/ResourceActivityType";
import { selectUserInAuthSchema } from "#src/schema/auth/usersInAuth";
import { selectResourceInResourceSchema } from "#src/schema/resource/resourcesInResource";
import { createAzureEntitySchema } from "#src/services/azure/table/createAzureEntitySchema";
import { getPropertyNames } from "@esposter/shared";
import { z } from "zod";

// `partitionKey` is the resourceId and `rowKey` the reverseTickedTimestamp, so a read is newest-first
// Without a sort.
// Payload fields are per-activityType and therefore all optional — Azure Table is schemaless per row.
// The API key is who wrote the entry beside its user: the key an agent came through, named as it was when it wrote,
// Or "" for the owner's own hand
export class ResourceActivityEntity extends AzureEntity {
  declare activityType: ResourceActivityType;
  apiKeyId = "";
  apiKeyName = "";
  newName?: string;
  oldName?: string;
  publishVersion?: number;
  declare rowKey: ReverseTickedTimestamp;
  declare userId: UserInAuth["id"];

  constructor(init?: Partial<ResourceActivityEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const ResourceActivityEntityPropertyNames = getPropertyNames<ResourceActivityEntity>();

export const resourceActivityEntitySchema = z.object({
  ...createAzureEntitySchema(
    z.object({ partitionKey: selectResourceInResourceSchema.shape.id, rowKey: reverseTickedTimestampSchema }),
  ).shape,
  activityType: resourceActivityTypeSchema,
  apiKeyId: z.string(),
  apiKeyName: z.string(),
  newName: z.string().optional(),
  oldName: z.string().optional(),
  publishVersion: z.int().positive().optional(),
  userId: selectUserInAuthSchema.shape.id,
}) satisfies z.ZodType<ToData<ResourceActivityEntity>>;
