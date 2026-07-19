import type { CompositeKeyEntity } from "@/models/azure/table/CompositeKeyEntity";
import type { User } from "@/schema/users";
import type { ToData } from "@esposter/shared";

import { AzureEntity, createAzureEntitySchema } from "@/models/azure/table/AzureEntity";
import { selectUserSchema } from "@/schema/users";
import { createNormalizedStringSchema, getPropertyNames } from "@esposter/shared";
import { z } from "zod";

export const MODERATION_NOTE_MAX_LENGTH = 2000;

export class ModerationNoteEntity extends AzureEntity {
  declare actorUserId: User["id"];
  declare note: string;
  declare targetUserId: User["id"];

  constructor(init?: Partial<ModerationNoteEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const ModerationNoteEntityPropertyNames = getPropertyNames<ModerationNoteEntity>();

export const moderationNoteEntitySchema = z.object({
  ...createAzureEntitySchema(
    z.object({
      // RoomId
      partitionKey: z.uuid(),
      // ReverseTickedTimestamp
      rowKey: z.string(),
    }),
  ).shape,
  actorUserId: selectUserSchema.shape.id,
  note: createNormalizedStringSchema(MODERATION_NOTE_MAX_LENGTH),
  targetUserId: selectUserSchema.shape.id,
}) satisfies z.ZodType<ToData<ModerationNoteEntity>>;
