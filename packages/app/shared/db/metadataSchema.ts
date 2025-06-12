import { timestamp } from "drizzle-orm/pg-core";

export const metadataSchema = {
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  deletedAt: timestamp("deletedAt"),
  updatedAt: timestamp("updatedAt")
    .notNull()
    .$onUpdateFn(() => new Date()),
};
