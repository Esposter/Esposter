import type { CompositeKeyEntity } from "@/models/azure/table/CompositeKeyEntity";
import type { ToData } from "@esposter/shared";

import { AzureEntity, createAzureEntitySchema } from "@/models/azure/table/AzureEntity";
import { selectUserSchema } from "schema/users";
import { z } from "zod";

export class BookmarkEntity extends AzureEntity {
  constructor(init?: Partial<BookmarkEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const bookmarkEntitySchema = z.object({
  ...createAzureEntitySchema(
    z.object({
      partitionKey: selectUserSchema.shape.id,
      // ${roomId}|${messageRowKey}
      rowKey: z.string(),
    }),
  ).shape,
}) satisfies z.ZodType<ToData<BookmarkEntity>>;
