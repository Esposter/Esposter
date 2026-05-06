import { timestamp } from "drizzle-orm/pg-core";

export const metadataSchema = {
  createdAt: timestamp().notNull().defaultNow(),
  deletedAt: timestamp(),
  updatedAt: timestamp()
    .notNull()
    .$onUpdateFn(() => new Date()),
};
