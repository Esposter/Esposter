import type { CompositeKeyEntity } from "#src/models/azure/table/CompositeKeyEntity";
import type { UserInAuth } from "#src/schema/auth/usersInAuth";
import type { ToData } from "@esposter/shared";

import { AzureEntity, createAzureEntitySchema } from "#src/models/azure/table/AzureEntity";
import { reverseTickedTimestampSchema } from "#src/models/azure/table/ReverseTickedTimestamp";
import { selectUserInAuthSchema } from "#src/schema/auth/usersInAuth";
import { selectRoomInMessageSchema } from "#src/schema/message/roomsInMessage";
import { MODERATION_NOTE_MAX_LENGTH } from "#src/services/message/constants";
import { createNormalizedStringSchema, getPropertyNames } from "@esposter/shared";
import { z } from "zod";

export class ModerationNoteEntity extends AzureEntity {
  declare actorUserId: UserInAuth["id"];
  declare note: string;
  declare targetUserId: UserInAuth["id"];

  constructor(init?: Partial<ModerationNoteEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const ModerationNoteEntityPropertyNames = getPropertyNames<ModerationNoteEntity>();

export const moderationNoteEntitySchema = z.object({
  ...createAzureEntitySchema(
    z.object({ partitionKey: selectRoomInMessageSchema.shape.id, rowKey: reverseTickedTimestampSchema }),
  ).shape,
  actorUserId: selectUserInAuthSchema.shape.id,
  note: createNormalizedStringSchema(MODERATION_NOTE_MAX_LENGTH),
  targetUserId: selectUserInAuthSchema.shape.id,
}) satisfies z.ZodType<ToData<ModerationNoteEntity>>;
