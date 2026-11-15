// A character's aura in the duel: none, or the one element it holds, which a reaction with the next element consumes
export const GcgAura = { None: "None" } as const;
export type GcgAura = (typeof GcgAura)[keyof typeof GcgAura];
