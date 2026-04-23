import type { CompositeKeyEntity } from "@/models/azure/table/CompositeKeyEntity";
import type { User } from "@/schema/users";
import type { ToData } from "@esposter/shared";

import { AzureEntity, createAzureEntitySchema } from "@/models/azure/table/AzureEntity";
import { AdminActionType, adminActionTypeSchema } from "@/models/message/AdminActionType";
import { selectUserSchema } from "@/schema/users";
import { z } from "zod";

export class ModerationLogEntity extends AzureEntity {
  actorId!: User["id"];
  durationMs?: number;
  targetUserId!: User["id"];
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
  actorId: selectUserSchema.shape.id,
  durationMs: z.int().positive().optional(),
  targetUserId: selectUserSchema.shape.id,
  type: adminActionTypeSchema,
}) satisfies z.ZodType<ToData<ModerationLogEntity>>;
