import type { CompositeKeyEntity } from "@/models/azure/table/CompositeKeyEntity";
import type { User } from "@/schema/users";
import type { ToData } from "@esposter/shared";

import { AzureEntity, createAzureEntitySchema } from "@/models/azure/table/AzureEntity";
import { ResourceActivityType, resourceActivityTypeSchema } from "@/models/resource/ResourceActivityType";
import { selectUserSchema } from "@/schema/users";
import { getPropertyNames } from "@esposter/shared";
import { z } from "zod";

// PartitionKey = resourceId, rowKey = reverseTickedTimestamp (newest-first without a sort).
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
      // ResourceId
      partitionKey: z.uuid(),
      // ReverseTickedTimestamp
      rowKey: z.string(),
    }),
  ).shape,
  activityType: resourceActivityTypeSchema,
  newName: z.string().optional(),
  oldName: z.string().optional(),
  publishVersion: z.int().positive().optional(),
  userId: selectUserSchema.shape.id,
}) satisfies z.ZodType<ToData<ResourceActivityEntity>>;
