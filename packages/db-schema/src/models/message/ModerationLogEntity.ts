import type { CompositeKeyEntity } from "@/models/azure/table/CompositeKeyEntity";
import type { User } from "@/schema/users";
import type { ToData } from "@esposter/shared";

import { AzureEntity, createAzureEntitySchema } from "@/models/azure/table/AzureEntity";
import { AdminActionType, adminActionTypeSchema } from "@/models/message/AdminActionType";
import { selectUserSchema } from "@/schema/users";
import { z } from "zod";

export class ModerationLogEntity extends AzureEntity {
  declare actorUserId: User["id"];
  durationMs?: number;
  declare targetUserId: User["id"];
  declare type: AdminActionType;

  constructor(init?: Partial<ModerationLogEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const moderationLogEntitySchema = z.object({
  ...createAzureEntitySchema(
    z.object({
      // RoomId
      partitionKey: z.uuid(),
      // ReverseTickedTimestamp
      rowKey: z.string(),
    }),
  ).shape,
  actorUserId: selectUserSchema.shape.id,
  durationMs: z.int().positive().optional(),
  targetUserId: selectUserSchema.shape.id,
  type: adminActionTypeSchema,
}) satisfies z.ZodType<ToData<ModerationLogEntity>>;
