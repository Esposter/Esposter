import { DomainKind } from "#src/models/domains/DomainKind";

// The Adventure Rank each kind of domain opens at, as the wiki's Domain page gives them
export const DomainOpenRankMap = {
  [DomainKind.Blessing]: 22,
  [DomainKind.Forgery]: 16,
  [DomainKind.Mastery]: 27,
} as const satisfies Record<DomainKind, number>;
