import { BlossomKind } from "#src/models/originalResin/BlossomKind";

// The Companionship EXP one claim at each blossom gives every character of the deployed team, the low end of the wiki's
// Range for its kind: a ley line's 10 to 20 by rank, a domain's 15 to 20, a normal boss's 30 to 45 and a weekly boss's
// 55 to 70 by its level. Provisional: a recorded claim's Companionship EXP measures each kind (roadmap, Recordings owed)
export const BlossomCompanionshipExpMap = {
  [BlossomKind.Domain]: 15,
  [BlossomKind.LeyLine]: 10,
  [BlossomKind.NormalBoss]: 30,
  [BlossomKind.WeeklyBoss]: 55,
} as const satisfies Record<BlossomKind, number>;
