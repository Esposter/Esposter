import type { CompositeKeyEntity } from "#src/models/azure/table/CompositeKeyEntity";
import type { User } from "#src/schema/users";
import type { ToData } from "@esposter/shared";
import type { Except } from "type-fest";

import { BaseMessageEntity, baseMessageEntitySchema } from "#src/models/message/BaseMessageEntity";
import { userIdSchema } from "#src/models/shared/UserId";
import { getPropertyNames } from "@esposter/shared";
import { z } from "zod";

export class StandardMessageEntity extends BaseMessageEntity {
  declare userId: User["id"];

  constructor(init?: Partial<StandardMessageEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const StandardMessageEntityPropertyNames = getPropertyNames<StandardMessageEntity>();

export const standardMessageEntitySchema = z.object({
  ...baseMessageEntitySchema.shape,
  ...userIdSchema.shape,
  // Link preview responses are generated only on the backend, so we exclude the field from the schema.
}) satisfies z.ZodType<ToData<Except<StandardMessageEntity, "linkPreviewResponse">>>;
