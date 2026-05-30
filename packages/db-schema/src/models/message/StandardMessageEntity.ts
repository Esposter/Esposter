import type { CompositeKeyEntity } from "@/models/azure/table/CompositeKeyEntity";
import type { User } from "@/schema/users";
import type { ToData } from "@esposter/shared";
import type { Except } from "type-fest";

import { BaseMessageEntity, baseMessageEntitySchema } from "@/models/message/BaseMessageEntity";
import { userIdSchema } from "@/models/shared/UserId";
import { getPropertyNames } from "@esposter/shared";
import { z } from "zod";

export class StandardMessageEntity extends BaseMessageEntity {
  userId!: User["id"];

  constructor(init?: Partial<StandardMessageEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const StandardMessageEntityPropertyNames = getPropertyNames<StandardMessageEntity>();

export const standardMessageEntitySchema = z.object({
  ...baseMessageEntitySchema.shape,
  ...userIdSchema.shape,
  // We only generate link preview responses via the backend, so we can safely exclude it from the schema
}) satisfies z.ZodType<ToData<Except<StandardMessageEntity, "linkPreviewResponse">>>;
