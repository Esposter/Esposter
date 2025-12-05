import type { CompositeKeyEntity } from "@/models/azure/table/CompositeKeyEntity";
import type { ToData } from "@esposter/shared";

import { AzureEntity, createAzureEntitySchema } from "@/models/azure/table/AzureEntity";
import { z } from "zod";

export class UserActivityEntity extends AzureEntity {
  acceptLanguage?: string;
  ipAddress?: string;
  referer?: string;
  triggerPath!: string;
  userAgent?: string;

  constructor(init?: Partial<UserActivityEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const userActivityEntitySchema = z.object({
  ...createAzureEntitySchema(
    z.object({
      partitionKey: z.string().uuid(), // userId
      // reverse-ticked timestamp
      rowKey: z.string(),
    }),
  ).shape,
  acceptLanguage: z.string().optional(),
  ipAddress: z.ipv4().or(z.ipv6()).optional(),
  referer: z.string().optional(),
  triggerPath: z.string(),
  userAgent: z.string().optional(),
}) satisfies z.ZodType<ToData<UserActivityEntity>>;
