import type { CompositeKeyEntity } from "@/models/azure/table/CompositeKeyEntity";
import type { ToData } from "@esposter/shared";

import { AzureEntity, createAzureEntitySchema } from "@/models/azure/table/AzureEntity";
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
      // userId
      partitionKey: z.string(),
      // ${roomId}|${messageRowKey}
      rowKey: z.string(),
    }),
  ).shape,
}) satisfies z.ZodType<ToData<BookmarkEntity>>;
