import type { DomainKind } from "#src/models/domains/DomainKind";

import { DomainOpenRankMap } from "#src/services/domains/DomainOpenRankMap";

// Whether a kind of domain is open at an Adventure Rank, from the rank it opens at
export const checkIsDomainKindOpenAtRank = (kind: DomainKind, adventureRank: number): boolean =>
  adventureRank >= DomainOpenRankMap[kind];
