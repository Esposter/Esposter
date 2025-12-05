import type { CompositeKeyEntity } from "@/models/azure/table/CompositeKeyEntity";
import type { ToData } from "@esposter/shared";

import { AzureEntity, createAzureEntitySchema } from "@/models/azure/table/AzureEntity";
import { selectUserSchema } from "@/schema/users";
import { z } from "zod";

export class UserActivityEntity extends AzureEntity {
  triggerPath!: string;
  userAgent!: string;

  constructor(init?: Partial<UserActivityEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const userActivityEntitySchema = z.object({
  ...createAzureEntitySchema(
    z.object({
      partitionKey: selectUserSchema.shape.id,
      // reverse-ticked timestamp
      rowKey: z.string(),
    }),
  ).shape,
  triggerPath: z.string(),
  userAgent: z.string(),
}) satisfies z.ZodType<ToData<UserActivityEntity>>;
