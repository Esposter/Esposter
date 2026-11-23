import { AchievementDefinitionMap } from "#shared/services/achievement/AchievementDefinitionMap";
import { achievementsInAchievement } from "@esposter/db-schema";
import { sql } from "drizzle-orm";

// Points live in the definition map, not the DB, so the summation reads them from one JSON object keyed by achievement
// Name. It is bound as a single parameter: a CASE with a branch per achievement binds two parameters for each, past the
// Bound Parameter limit D1 holds a statement to. Keeping the aggregation in SQL bounds the result set to one row per
// User.
const achievementPoints = JSON.stringify(
  Object.fromEntries(Object.entries(AchievementDefinitionMap).map(([name, { points }]) => [name, points])),
);

export const achievementPointsSummation = sql<number>`sum(coalesce(json_extract(${achievementPoints}, '$."' || ${achievementsInAchievement.name} || '"'), 0))`;
