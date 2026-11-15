// Where a duel is: the preparation before its first round, the roll phase, the action phase where both sides take turns,
// And the end once a side is defeated or the duel concedes
export const GcgPhase = { Action: "Action", Ended: "Ended", Preparation: "Preparation", Roll: "Roll" } as const;
export type GcgPhase = (typeof GcgPhase)[keyof typeof GcgPhase];
