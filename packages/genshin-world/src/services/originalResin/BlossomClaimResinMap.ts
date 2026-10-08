import { BlossomKind } from "#src/models/originalResin/BlossomKind";

// What one claim at each blossom costs in Original Resin, a weekly boss's apart, since its price depends on the claims
// That week. A ley line's and a domain's claim is 20 each, two of them 40, and a normal boss's is 40
export const BlossomClaimResinMap = {
  [BlossomKind.Domain]: 20,
  [BlossomKind.LeyLine]: 20,
  [BlossomKind.NormalBoss]: 40,
} as const satisfies Record<Exclude<BlossomKind, BlossomKind.WeeklyBoss>, number>;
