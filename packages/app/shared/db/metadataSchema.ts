import { ItemMetadataPropertyNames } from "#shared/models/entity/ItemMetadata";
import { timestamp } from "drizzle-orm/pg-core";

export const metadataSchema = {
  createdAt: timestamp(ItemMetadataPropertyNames.createdAt).notNull().defaultNow(),
  deletedAt: timestamp(ItemMetadataPropertyNames.deletedAt),
  updatedAt: timestamp(ItemMetadataPropertyNames.updatedAt)
    .notNull()
    .$onUpdateFn(() => new Date()),
};
