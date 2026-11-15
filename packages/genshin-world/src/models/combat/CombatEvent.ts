// What a step of the world's combat tells the world: the party entered combat, or left it once no enemy had been
// Aggravated on it for the grace period
export const CombatEvent = { Enter: "Enter", Leave: "Leave" } as const;
export type CombatEvent = (typeof CombatEvent)[keyof typeof CombatEvent];
