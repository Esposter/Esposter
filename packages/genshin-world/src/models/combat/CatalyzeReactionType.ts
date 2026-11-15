// The reactions that add a flat bonus to the base damage of the hit that triggers them, on a Quicken aura
export const CatalyzeReactionType = { Aggravate: "Aggravate", Spread: "Spread" } as const;
export type CatalyzeReactionType = (typeof CatalyzeReactionType)[keyof typeof CatalyzeReactionType];
