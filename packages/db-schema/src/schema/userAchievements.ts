import { pgTable } from "@/pgTable";
import { achievements } from "@/schema/achievements";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { check, integer, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const userAchievements = pgTable(
  "user_achievements",
  {
    achievementId: uuid("achievement_id")
      .notNull()
      .references(() => achievements.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    id: uuid("id").primaryKey().defaultRandom(),
    unlockedAt: timestamp("unlocked_at"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ achievementId, amount, userId }) => [
      uniqueIndex().on(userId, achievementId),
      check("amount", sql`${amount} >= 1`),
    ],
  },
);

export type UserAchievement = typeof userAchievements.$inferSelect;

export const selectUserAchievementSchema = createSelectSchema(userAchievements, {
  amount: z.int().min(1),
});
