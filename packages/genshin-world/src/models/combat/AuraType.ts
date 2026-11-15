// What an element leaves on a target: the five elements an attack can leave as an aura, and the three a reaction leaves,
// Freeze over a frozen target, Quicken where Dendro met Electro, and Burning over a burning target
export const AuraType = {
  Burning: "Burning",
  Cryo: "Cryo",
  Dendro: "Dendro",
  Electro: "Electro",
  Freeze: "Freeze",
  Hydro: "Hydro",
  Pyro: "Pyro",
  Quicken: "Quicken",
} as const;
export type AuraType = (typeof AuraType)[keyof typeof AuraType];
