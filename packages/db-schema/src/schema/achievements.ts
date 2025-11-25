import { pgTable } from "@/pgTable";
import { userAchievements } from "@/schema/userAchievements";
import { relations, sql } from "drizzle-orm";
import { boolean, check, integer, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const ACHIEVEMENT_NAME_MAX_LENGTH = 100;
export const ACHIEVEMENT_DESCRIPTION_MAX_LENGTH = 500;

export enum AchievementCategory {
  Messaging = "Messaging",
  Milestone = "Milestone",
  Social = "Social",
  Special = "Special",
}

export enum AchievementType {
  Instant = "Instant",
  Progressive = "Progressive",
}

export const achievements = pgTable(
  "achievements",
  {
    category: text("category").$type<AchievementCategory>().notNull(),
    description: text("description").notNull(),
    icon: text("icon").notNull(),
    id: uuid("id").primaryKey().defaultRandom(),
    isHidden: boolean("is_hidden").notNull().default(false),
    name: text("name").notNull().unique(),
    points: integer("points").notNull().default(1),
    type: text("type").$type<AchievementType>().notNull(),
  },
  {
    extraConfig: ({ description, name, points }) => [
      check(
        "name",
        sql`LENGTH(${name}) >= 1 AND LENGTH(${name}) <= ${sql.raw(ACHIEVEMENT_NAME_MAX_LENGTH.toString())}`,
      ),
      check(
        "description",
        sql`LENGTH(${description}) >= 1 AND LENGTH(${description}) <= ${sql.raw(ACHIEVEMENT_DESCRIPTION_MAX_LENGTH.toString())}`,
      ),
      check("points", sql`${points} >= 1`),
    ],
  },
);

export type Achievement = typeof achievements.$inferSelect;

export const selectAchievementSchema = createSelectSchema(achievements, {
  category: z.enum(AchievementCategory),
  description: z.string().min(1).max(ACHIEVEMENT_DESCRIPTION_MAX_LENGTH),
  name: z.string().min(1).max(ACHIEVEMENT_NAME_MAX_LENGTH),
  points: z.int().positive(),
  type: z.enum(AchievementType),
});

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));
