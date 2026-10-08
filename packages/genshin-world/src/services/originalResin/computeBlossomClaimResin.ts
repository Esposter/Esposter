import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { BlossomClaimResinMap } from "#src/services/originalResin/BlossomClaimResinMap";
import {
  WEEKLY_BOSS_CHEAP_CLAIMS,
  WEEKLY_BOSS_CHEAP_RESIN,
  WEEKLY_BOSS_RESIN,
} from "#src/services/originalResin/constants";

// The Original Resin one claim at a blossom costs. A weekly boss's first claims in the week, `weeklyBossClaimsMade`, are
// The cheap ones, and every claim after them the full price
export const computeBlossomClaimResin = (kind: BlossomKind, weeklyBossClaimsMade: number): number => {
  if (kind !== BlossomKind.WeeklyBoss) return BlossomClaimResinMap[kind];
  return weeklyBossClaimsMade < WEEKLY_BOSS_CHEAP_CLAIMS ? WEEKLY_BOSS_CHEAP_RESIN : WEEKLY_BOSS_RESIN;
};
