// The kinds of star condition a chamber sets: the time left on its clock when it is cleared, or the Ley Line Monolith's
// Health left, each read against a mark the chamber names
export const AbyssStarConditionKind = { LeftTime: "LeftTime", MonolithHealth: "MonolithHealth" } as const;
export type AbyssStarConditionKind = (typeof AbyssStarConditionKind)[keyof typeof AbyssStarConditionKind];
