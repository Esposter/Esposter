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
    id: uuid("id").primaryKey().defaultRandom(),
    points: integer("points").default(1),
    unlockedAt: timestamp("unlocked_at"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ achievementId, points, userId }) => [
      uniqueIndex().on(userId, achievementId),
      check("points", sql`${points} >= 1`),
    ],
  },
);

export type NewUserAchievement = typeof userAchievements.$inferInsert;
export type UserAchievement = typeof userAchievements.$inferSelect;

export const selectUserAchievementSchema = createSelectSchema(userAchievements, {
  points: z.int().min(1),
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
