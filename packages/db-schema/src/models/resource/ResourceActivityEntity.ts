import type { CompositeKeyEntity } from "#src/models/azure/table/CompositeKeyEntity";
import type { User } from "#src/schema/users";
import type { ToData } from "@esposter/shared";

import { AzureEntity, createAzureEntitySchema } from "#src/models/azure/table/AzureEntity";
import { ResourceActivityType, resourceActivityTypeSchema } from "#src/models/resource/ResourceActivityType";
import { selectUserSchema } from "#src/schema/users";
import { getPropertyNames } from "@esposter/shared";
import { z } from "zod";

// `partitionKey` is the resourceId and `rowKey` the reverseTickedTimestamp, so a read is newest-first
// Without a sort.
// Payload fields are per-activityType and therefore all optional — Azure Table is schemaless per row.
export class ResourceActivityEntity extends AzureEntity {
  declare activityType: ResourceActivityType;
  newName?: string;
  oldName?: string;
  publishVersion?: number;
  declare userId: User["id"];

  constructor(init?: Partial<ResourceActivityEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const ResourceActivityEntityPropertyNames = getPropertyNames<ResourceActivityEntity>();

export const resourceActivityEntitySchema = z.object({
  ...createAzureEntitySchema(
    z.object({
      partitionKey: z.uuid(),
      rowKey: z.string(),
    }),
  ).shape,
  activityType: resourceActivityTypeSchema,
  newName: z.string().optional(),
  oldName: z.string().optional(),
  publishVersion: z.int().positive().optional(),
  userId: selectUserSchema.shape.id,
}) satisfies z.ZodType<ToData<ResourceActivityEntity>>;
