import type { CompositeKeyEntity } from "@/models/azure/table/CompositeKeyEntity";
import type { ToData } from "@esposter/shared";
import type { Except } from "type-fest";

import { BaseMessageEntity, baseMessageEntitySchema } from "@/models/message/BaseMessageEntity";
import { selectUserSchema } from "@/schema/users";
import { getPropertyNames } from "@esposter/shared";
import { z } from "zod";

export class StandardMessageEntity extends BaseMessageEntity {
  userId!: string;

  constructor(init?: Partial<StandardMessageEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const StandardMessageEntityPropertyNames = getPropertyNames<StandardMessageEntity>();

export const standardMessageEntitySchema = z.object({
  ...baseMessageEntitySchema.shape,
  userId: selectUserSchema.shape.id,
  // We only generate link preview responses via the backend, so we can safely exclude it from the schema
}) satisfies z.ZodType<ToData<Except<StandardMessageEntity, "linkPreviewResponse">>>;
