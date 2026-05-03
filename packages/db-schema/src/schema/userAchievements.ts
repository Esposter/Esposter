import { pgTable } from "@/pgTable";
import { achievements } from "@/schema/achievements";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { check, integer, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const userAchievements = pgTable(
  "user_achievements",
  {
    achievementId: uuid("achievementId")
      .notNull()
      .references(() => achievements.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    id: uuid("id").primaryKey().defaultRandom(),
    unlockedAt: timestamp("unlockedAt"),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ achievementId, amount, userId }) => [
      uniqueIndex("user_achievements_userId_achievementId_unique").on(userId, achievementId),
      check("user_achievements_amount_check", sql`${amount} >= 1`),
    ],
  },
);

export type UserAchievement = typeof userAchievements.$inferSelect;

export const selectUserAchievementSchema = createSelectSchema(userAchievements, {
  amount: (schema) => schema.min(1),
});
