// The two things an expedition talent does: it shortens the expedition sent to its region, or adds to the rewards of the one
// Sent to its region for its hours
export const ExpeditionPassiveKind = { Reward: "Reward", Time: "Time" } as const;
export type ExpeditionPassiveKind = (typeof ExpeditionPassiveKind)[keyof typeof ExpeditionPassiveKind];
