import type { DomainKind } from "#src/models/domains/DomainKind";
import type { DomainLevel } from "#src/models/domains/DomainSchedule";

import { checkIsDomainKindOpenAtRank } from "#src/services/domains/checkIsDomainKindOpenAtRank";
import { checkIsDomainKindOpenOnDay } from "#src/services/domains/checkIsDomainKindOpenOnDay";

// Whether a level of a challenge domain is open to the player: its kind is open at the player's Adventure Rank, the level
// Is at or below that rank, and the domain is open on the day
export const checkIsDomainLevelOpen = (
  kind: DomainKind,
  level: DomainLevel,
  adventureRank: number,
  day: Temporal.PlainDate,
): boolean =>
  checkIsDomainKindOpenAtRank(kind, adventureRank) &&
  level.recommendedRank <= adventureRank &&
  checkIsDomainKindOpenOnDay(kind, day, level.scheduledDaysOfWeek);
