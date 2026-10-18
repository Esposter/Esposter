import { z } from "zod";

// One level of a weekly boss's trounce domain as the game's tables set it: its boss dungeon, the enemies' level it fights at
// And the recommended Adventure Rank it is set at
export interface WeeklyBossLevel {
  dungeonId: number;
  enemyLevel: number;
  recommendedRank: number;
}

export const weeklyBossLevelSchema = z.object({
  dungeonId: z.int().positive(),
  enemyLevel: z.int().positive(),
  recommendedRank: z.int().positive(),
}) satisfies z.ZodType<WeeklyBossLevel>;

// A weekly boss's trounce domain, its levels lowest dungeon first
export interface WeeklyBossDomain {
  levels: WeeklyBossLevel[];
}

export const weeklyBossDomainSchema = z.object({
  levels: z.array(weeklyBossLevelSchema),
}) satisfies z.ZodType<WeeklyBossDomain>;

// The weekly bosses' trounce domains by their entrance's entry id, as the domains dataset publishes them
export const weeklyBossDomainsSchema = z.record(z.string(), weeklyBossDomainSchema);
