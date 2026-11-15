// The elemental reactions the duel's standard rule runs, each named by its effect: the damage it adds, the aura it
// Consumes, and any piercing, shield, spread or status it leaves
export const GcgReactionKind = {
  Bloom: "Bloom",
  Burning: "Burning",
  Crystallize: "Crystallize",
  ElectroCharged: "ElectroCharged",
  Frozen: "Frozen",
  Melt: "Melt",
  Overloaded: "Overloaded",
  Quicken: "Quicken",
  Superconduct: "Superconduct",
  Swirl: "Swirl",
  Vaporize: "Vaporize",
} as const;
export type GcgReactionKind = (typeof GcgReactionKind)[keyof typeof GcgReactionKind];
