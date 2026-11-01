import { treeArtifactSchema } from "#src/models/domains/TreeArtifact";
import { rewardItemSchema } from "#src/models/reward/RewardItem";
import { z } from "zod";

// One level of a challenge domain as the game's tables set it: its dungeon, the recommended Adventure Rank and the
// Enemies' level it is set at, and the days of the week its pair is set for. A Domain of Blessing's levels are set for
// Every day
export const domainLevelSchema = z.object({
  // The ley line disorder the level's fight runs under, named by the dump's level config. The modifiers the fight models are in
  // Services/domains/DisorderDefinitionMap, and a disorder not there changes nothing yet
  disorder: z.string(),
  dungeonId: z.int(),
  enemyLevel: z.int(),
  recommendedRank: z.int(),
  // The resin a Petrified Tree claim of this level costs, the items each claim draws, each by its least and most, and the
  // Artifacts each claim draws, from the dump's tables and the wiki's counts
  resinCost: z.int().nonnegative(),
  scheduledDaysOfWeek: z.array(z.int().min(1).max(7)),
  treeArtifacts: z.array(treeArtifactSchema),
  treeRewards: z.array(rewardItemSchema),
});

export type DomainLevel = z.infer<typeof domainLevelSchema>;
