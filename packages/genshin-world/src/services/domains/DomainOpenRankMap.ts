import { DomainKind } from "#src/models/domains/DomainKind";

// The Adventure Rank each kind of domain opens at. Provisional: the ranks the domains proposal states, not yet checked
// Against the wiki, which may name an earlier rank by a quest
export const DomainOpenRankMap = {
  [DomainKind.Blessing]: 22,
  [DomainKind.Forgery]: 16,
  [DomainKind.Mastery]: 27,
} as const satisfies Record<DomainKind, number>;
