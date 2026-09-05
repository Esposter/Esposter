import type { CompositeKeyEntity } from "#src/models/azure/table/CompositeKeyEntity";
import type { User } from "#src/schema/users";
import type { ToData } from "@esposter/shared";

import { AzureEntity, createAzureEntitySchema } from "#src/models/azure/table/AzureEntity";
import { AdminActionType, adminActionTypeSchema } from "#src/models/message/AdminActionType";
import { selectUserSchema } from "#src/schema/users";
import { getPropertyNames } from "@esposter/shared";
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

export const ModerationLogEntityPropertyNames = getPropertyNames<ModerationLogEntity>();

export const moderationLogEntitySchema = z.object({
  ...createAzureEntitySchema(
    z.object({
      // `roomId`
      partitionKey: z.uuid(),
      // `reverseTickedTimestamp`
      rowKey: z.string(),
    }),
  ).shape,
  actorUserId: selectUserSchema.shape.id,
  durationMs: z.int().positive().optional(),
  targetUserId: selectUserSchema.shape.id,
  type: adminActionTypeSchema,
}) satisfies z.ZodType<ToData<ModerationLogEntity>>;
