import { BlossomKind } from "#src/models/originalResin/BlossomKind";

// The Companionship EXP one claim at a blossom gives every character of the deployed team, the low end of the wiki's
// Range for its kind: a ley line's 10 to 20 by rank, a normal boss's 30 to 45 and a weekly boss's 55 to 70 by its level.
// A domain's Petrified Tree gives the count its level's reward preview holds, so the domain has no entry here.
// Provisional: a recorded claim's Companionship EXP measures each kind (roadmap, Recordings owed)
export const BlossomCompanionshipExpMap = {
  [BlossomKind.LeyLine]: 10,
  [BlossomKind.NormalBoss]: 30,
  [BlossomKind.WeeklyBoss]: 55,
} as const satisfies Partial<Record<BlossomKind, number>>;
