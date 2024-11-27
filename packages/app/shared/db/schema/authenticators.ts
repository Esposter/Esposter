import { pgTable } from "@/shared/db/pgTable";
import { users } from "@/shared/db/schema/users";
import { relations } from "drizzle-orm";
import { boolean, integer, primaryKey, text, uuid } from "drizzle-orm/pg-core";

export const authenticators = pgTable(
  "Authenticator",
  {
    counter: integer("counter").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialID: text("credentialID").notNull().unique(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    transports: text("transports"),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  ({ credentialID, userId }) => [
    primaryKey({
      columns: [userId, credentialID],
    }),
  ],
);

export const authenticatorsRelations = relations(authenticators, ({ one }) => ({
  user: one(users, {
    fields: [authenticators.userId],
    references: [users.id],
  }),
}));
