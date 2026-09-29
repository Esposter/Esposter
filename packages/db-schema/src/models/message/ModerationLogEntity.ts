import type { CompositeKeyEntity } from "#src/models/azure/table/CompositeKeyEntity";
import type { AdminActionType } from "#src/models/message/AdminActionType";
import type { UserInAuth } from "#src/schema/auth/usersInAuth";
import type { ToData } from "@esposter/shared";

import { AzureEntity, createAzureEntitySchema } from "#src/models/azure/table/AzureEntity";
import { reverseTickedTimestampSchema } from "#src/models/azure/table/ReverseTickedTimestamp";
import { adminActionTypeSchema } from "#src/models/message/AdminActionType";
import { selectUserInAuthSchema } from "#src/schema/auth/usersInAuth";
import { selectRoomInMessageSchema } from "#src/schema/message/roomsInMessage";
import { getPropertyNames } from "@esposter/shared";
import { z } from "zod";

export class ModerationLogEntity extends AzureEntity {
  declare actorUserId: UserInAuth["id"];
  durationMs?: number;
  declare targetUserId: UserInAuth["id"];
  declare type: AdminActionType;

  constructor(init?: Partial<ModerationLogEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const ModerationLogEntityPropertyNames = getPropertyNames<ModerationLogEntity>();

export const moderationLogEntitySchema = z.object({
  ...createAzureEntitySchema(
    z.object({ partitionKey: selectRoomInMessageSchema.shape.id, rowKey: reverseTickedTimestampSchema }),
  ).shape,
  actorUserId: selectUserInAuthSchema.shape.id,
  durationMs: z.int().positive().optional(),
  targetUserId: selectUserInAuthSchema.shape.id,
  type: adminActionTypeSchema,
}) satisfies z.ZodType<ToData<ModerationLogEntity>>;
