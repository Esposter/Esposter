// The two blossoms a ley line outcrop can be: Revelation gives Character EXP materials, and Wealth gives Mora. A region
// Holds one of each, and each is drawn to its own place in the region's groups
export const OutcropKind = { Revelation: "Revelation", Wealth: "Wealth" } as const;
export type OutcropKind = (typeof OutcropKind)[keyof typeof OutcropKind];
