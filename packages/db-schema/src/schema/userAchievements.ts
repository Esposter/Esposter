import { pgTable } from "#src/pgTable";
import { achievements } from "#src/schema/achievements";
import { users } from "#src/schema/users";
import { sql } from "drizzle-orm";
import { check, integer, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const userAchievements = pgTable(
  "userAchievements",
  {
    achievementId: uuid()
      .notNull()
      .references(() => achievements.id, { onDelete: "cascade" }),
    amount: integer().notNull(),
    unlockedAt: timestamp(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ achievementId, amount, userId }) => [
      primaryKey({ columns: [userId, achievementId] }),
      check("userAchievements_amount_check", sql`${amount} >= 1`),
    ],
  },
);

export type UserAchievement = typeof userAchievements.$inferSelect;
