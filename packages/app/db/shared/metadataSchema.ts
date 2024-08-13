import type { pgTable } from "drizzle-orm/pg-core";

import { timestamp } from "drizzle-orm/pg-core";

export const metadataSchema = {
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  deletedAt: timestamp("deletedAt", { mode: "date" }),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .notNull()
    .$onUpdateFn(() => new Date()),
} satisfies Parameters<typeof pgTable>[1];
