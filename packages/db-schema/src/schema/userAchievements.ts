import type { Achievement } from "@/schema/achievements";

import { pgTable } from "@/pgTable";
import { achievements } from "@/schema/achievements";
import { users } from "@/schema/users";
import { relations, sql } from "drizzle-orm";
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

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
}));
// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const UserAchievementRelations = {
  achievement: true,
} as const;
export type UserAchievementWithRelations = UserAchievement & { achievement: Achievement };
