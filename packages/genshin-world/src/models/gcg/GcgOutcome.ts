// How a duel ended: one side had no character left standing, or the duel ran out of rounds and both sides conceded
export const GcgOutcome = { Conceded: "Conceded", Victory: "Victory" } as const;
export type GcgOutcome = (typeof GcgOutcome)[keyof typeof GcgOutcome];
