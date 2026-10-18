import { DomainKind } from "#src/models/domains/DomainKind";
import { WEEKLY_BOSS_QUICK_CHALLENGE_ADVENTURE_RANK } from "#src/services/bosses/constants";

// The Adventure Rank each kind of domain opens at, as the wiki's Domain page gives them. A Trounce Domain opens at the rank
// Its quick challenge takes, the wiki's Trounce Domain page giving that as the rank a locked one is quick challenged from
export const DomainOpenRankMap = {
  [DomainKind.Blessing]: 22,
  [DomainKind.Forgery]: 16,
  [DomainKind.Mastery]: 27,
  [DomainKind.Trounce]: WEEKLY_BOSS_QUICK_CHALLENGE_ADVENTURE_RANK,
} as const satisfies Record<DomainKind, number>;
