import { achievementSchema } from "#src/schema/achievement/achievementSchema";
import { achievementsInAchievement } from "#src/schema/achievement/achievementsInAchievement";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { createMinimumCheckSql } from "#src/services/shared/createMinimumCheckSql";
import { sqliteTable } from "#src/sqliteTable";
import { check, integer, primaryKey, text } from "drizzle-orm/sqlite-core";

export const userAchievementsInAchievement = sqliteTable(
  "userAchievements",
  {
    achievementId: text()
      .notNull()
      .references(() => achievementsInAchievement.id, { onDelete: "cascade" }),
    amount: integer().notNull(),
    unlockedAt: integer({ mode: "timestamp_ms" }),
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
