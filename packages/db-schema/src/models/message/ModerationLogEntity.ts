import type { CompositeKeyEntity } from "@/models/azure/table/CompositeKeyEntity";
import type { ToData } from "@esposter/shared";

import { AzureEntity, createAzureEntitySchema } from "@/models/azure/table/AzureEntity";
import { AdminActionType, adminActionTypeSchema } from "@/models/message/AdminActionType";
import { z } from "zod";

export class ModerationLogEntity extends AzureEntity {
  actorId!: string;
  durationMs?: number;
  targetId!: string;
  type!: AdminActionType;

  constructor(init?: Partial<ModerationLogEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const moderationLogEntitySchema = z.object({
  ...createAzureEntitySchema(
    z.object({
      // roomId
      partitionKey: z.uuid(),
      // reverseTickedTimestamp
      rowKey: z.string(),
    }),
  ).shape,
  actorId: z.string(),
  durationMs: z.number().int().positive().optional(),
  targetId: z.string(),
  type: adminActionTypeSchema,
}) satisfies z.ZodType<ToData<ModerationLogEntity>>;
