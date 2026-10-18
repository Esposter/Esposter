import { DomainKind } from "#src/models/domains/DomainKind";
import { treeArtifactSchema } from "#src/models/domains/TreeArtifact";
import { rewardItemSchema } from "#src/models/reward/RewardItem";
import { z } from "zod";

// One level of a challenge domain as the game's tables set it: its dungeon, the recommended Adventure Rank and the
// Enemies' level it is set at, and the days of the week its pair is set for. A Domain of Blessing's levels are set for
// Every day
export const domainLevelSchema = z.object({
  dungeonId: z.int(),
  enemyLevel: z.int(),
  recommendedRank: z.int(),
  scheduledDaysOfWeek: z.array(z.int().min(1).max(7)),
  // The resin a Petrified Tree claim of this level costs, the items each claim draws, each by its least and most, and the
  // Artifacts each claim draws, from the dump's tables and the wiki's counts
  resinCost: z.int().min(0),
  treeArtifacts: z.array(treeArtifactSchema),
  treeRewards: z.array(rewardItemSchema),
});

// A challenge domain's kind, the artifact sets a Domain of Blessing's claim draws its artifacts among (none for the other
// Kinds, and none yet for the Blessing domains, whose sets the dump's text does not name), and its levels, read by its
// Entrance's entry id
export const domainScheduleSchema = z.object({
  artifactSetIds: z.array(z.int().positive()),
  kind: z.enum(DomainKind),
  levels: z.array(domainLevelSchema),
});

export type DomainLevel = z.infer<typeof domainLevelSchema>;
export type DomainSchedule = z.infer<typeof domainScheduleSchema>;
