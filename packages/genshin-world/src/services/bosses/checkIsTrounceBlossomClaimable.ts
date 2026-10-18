import type { TrounceBlossom } from "#src/models/bosses/TrounceBlossom";

import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { checkIsWeeklyBossClaimable } from "#src/services/bosses/checkIsWeeklyBossClaimable";

// Whether a Trounce Blossom can be claimed at a time: a normal boss's once, since its blossom is forgotten when the boss
// Comes back, and a weekly boss's once each week, counted from the week's reset as its other weekly claims are
export const checkIsTrounceBlossomClaimable = (trounceBlossom: TrounceBlossom, now: Temporal.Instant): boolean =>
  trounceBlossom.kind === BlossomKind.WeeklyBoss
    ? checkIsWeeklyBossClaimable(trounceBlossom.claimedAts, now)
    : trounceBlossom.claimedAts.length === 0;
