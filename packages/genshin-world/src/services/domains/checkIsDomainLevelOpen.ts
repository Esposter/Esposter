import type { DomainKind } from "#src/models/domains/DomainKind";
import type { DomainLevel } from "#src/models/domains/DomainSchedule";

import { checkIsDomainKindOpenAtRank } from "#src/services/domains/checkIsDomainKindOpenAtRank";
import { checkIsDomainKindOpenOnDay } from "#src/services/domains/checkIsDomainKindOpenOnDay";

// Whether a level of a challenge domain is open to the player at a moment: its kind is open at the player's Adventure
// Rank, the level is at or below that rank, and the domain is open on the game day the moment falls in
export const checkIsDomainLevelOpen = (
  kind: DomainKind,
  level: DomainLevel,
  adventureRank: number,
  now: Temporal.Instant,
): boolean =>
  checkIsDomainKindOpenAtRank(kind, adventureRank) &&
  level.recommendedRank <= adventureRank &&
  checkIsDomainKindOpenOnDay(kind, now, level.scheduledDaysOfWeek);
