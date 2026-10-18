import type { DomainSchedule } from "#src/models/domains/DomainSchedule";

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

// Each level of a domain as its entry screen lists it, with the state the player finds it in at the rank and the day
export const computeDomainLevelRows = (
  { kind, levels }: DomainSchedule,
  adventureRank: number,
  day: Temporal.PlainDate,
): DomainLevelRow[] =>
  levels.map((level) => {
    const requiredRank = Math.max(DomainOpenRankMap[kind], level.recommendedRank);
    let state = DomainLevelState.Closed;
    if (checkIsDomainLevelOpen(kind, level, adventureRank, day)) state = DomainLevelState.Open;
    else if (requiredRank > adventureRank) state = DomainLevelState.RankRequired;
    return { dungeonId: level.dungeonId, enemyLevel: level.enemyLevel, requiredRank, state };
  });
