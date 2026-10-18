import type { DomainSchedule } from "#src/models/domains/DomainSchedule";
import type { DomainChallengeLevel } from "#src/services/domains/domainChallengeLevels";

import { DomainLevelState } from "#src/models/domains/DomainLevelState";
import { checkIsDomainLevelOpen } from "#src/services/domains/checkIsDomainLevelOpen";
import { DomainOpenRankMap } from "#src/services/domains/DomainOpenRankMap";

export interface DomainLevelRow {
  dungeonId: number;
  enemyLevel: number;
  // The Adventure Rank the level asks for: its recommended rank, or the rank its kind opens at where that is higher
  requiredRank: number;
  state: DomainLevelState;
}

// Each level of a domain as its entry screen lists it, with the state the player finds it in at the rank and the moment.
// A level with no challenge data has nothing to run, so it reads as Closed rather than opening onto a silent no-op
export const computeDomainLevelRows = (
  { kind, levels }: DomainSchedule,
  challengeLevels: Readonly<Record<number, DomainChallengeLevel>>,
  adventureRank: number,
  now: Temporal.Instant,
): DomainLevelRow[] =>
  levels.map((level) => {
    const requiredRank = Math.max(DomainOpenRankMap[kind], level.recommendedRank);
    let state = DomainLevelState.Closed;
    if (!challengeLevels[level.recommendedRank]) state = DomainLevelState.Closed;
    else if (checkIsDomainLevelOpen(kind, level, adventureRank, now)) state = DomainLevelState.Open;
    else if (requiredRank > adventureRank) state = DomainLevelState.RankRequired;
    return { dungeonId: level.dungeonId, enemyLevel: level.enemyLevel, requiredRank, state };
  });
