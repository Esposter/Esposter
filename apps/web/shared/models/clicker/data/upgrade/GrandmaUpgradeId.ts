export const GrandmaUpgradeId = {
  AgingAgents: "Aging Agents",
  DoubleThickGlasses: "Double-thick Glasses",
  ForwardsFromGrandma: "Forwards From Grandma",
  GenerationDegeneration: "Generation Degeneration",
  GoodManners: "Good Manners",
  KitchenCabinets: "Kitchen Cabinets",
  LubricatedDentures: "Lubricated Dentures",
  PruneJuice: "Prune Juice",
  ReverseDementia: "Reverse Dementia",
  SteelPlatedRollingPins: "Steel-plated Rolling Pins",
  TheUnbridling: "The Unbridling",
  TimeproofHairDyes: "Timeproof Hair Dyes",
  Visits: "Visits",
  XtremeWalkers: "Xtreme Walkers",
} as const;
export type GrandmaUpgradeId = (typeof GrandmaUpgradeId)[keyof typeof GrandmaUpgradeId];
