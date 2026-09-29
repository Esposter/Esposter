import { pgTable } from "#src/pgTable";
import { achievementSchema } from "#src/schema/achievement/achievementSchema";
import { achievementsInAchievement } from "#src/schema/achievement/achievementsInAchievement";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { createMinimumCheckSql } from "#src/services/shared/createMinimumCheckSql";
import { check, integer, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const userAchievementsInAchievement = pgTable(
  "userAchievements",
  {
    achievementId: uuid()
      .notNull()
      .references(() => achievementsInAchievement.id, { onDelete: "cascade" }),
    amount: integer().notNull(),
    unlockedAt: timestamp(),
    userId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ achievementId, amount, userId }) => [
      primaryKey({ columns: [userId, achievementId] }),
      check("userAchievements_amount_check", createMinimumCheckSql(amount, 1)),
    ],
    schema: achievementSchema,
  },
);

export type UserAchievementInAchievement = typeof userAchievementsInAchievement.$inferSelect;
