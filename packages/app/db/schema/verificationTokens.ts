import { pgTable } from "@/db/shared/pgTable";
import { primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const verificationTokens = pgTable(
  "VerificationToken",
  {
    expires: timestamp("expires", { mode: "date" }).notNull(),
    identifier: text("identifier").notNull(),
    token: text("token").notNull().unique(),
  },
  (verificationToken) => ({
    compoundKey: primaryKey({ columns: [verificationToken.identifier, verificationToken.token] }),
  }),
);
