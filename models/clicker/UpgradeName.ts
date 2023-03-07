export enum CursorUpgradeName {
  "Reinforced Index Finger" = "Reinforced Index Finger",
  "Carpal Tunnel Prevention Cream" = "Carpal Tunnel Prevention Cream",
  Ambidextrous = "Ambidextrous",
  "Thousand Fingers" = "Thousand Fingers",
  "Million Fingers" = "Million Fingers",
  "Billion Fingers" = "Billion Fingers",
  "Trillion Fingers" = "Trillion Fingers",
  "Quadrillion Fingers" = "Quadrillion Fingers",
  "Quintillion Fingers" = "Quintillion Fingers",
  "Sextillion Fingers" = "Sextillion Fingers",
  "Septillion Fingers" = "Septillion Fingers",
  "Octillion Fingers" = "Octillion Fingers",
  "Nonillion Fingers" = "Nonillion Fingers",
  "Decillion Fingers" = "Decillion Fingers",
}

export enum GrandmaUpgradeName {
  "Forwards From Grandma" = "Forwards From Grandma",
  "Steel-plated Rolling Pins" = "Steel-plated Rolling Pins",
  "Lubricated Dentures" = "Lubricated Dentures",
  "Prune Juice" = "Prune Juice",
  "Double-thick Glasses" = "Double-thick Glasses",
  "Aging Agents" = "Aging Agents",
  "Xtreme Walkers" = "Xtreme Walkers",
  "The Unbridling" = "The Unbridling",
  "Reverse Dementia" = "Reverse Dementia",
  "Timeproof Hair Dyes" = "Timeproof Hair Dyes",
  "Good Manners" = "Good Manners",
  "Generation Degeneration" = "Generation Degeneration",
  "Visits" = "Visits",
  "Kitchen Cabinets" = "Kitchen Cabinets",
}

export const UpgradeName = { ...CursorUpgradeName, ...GrandmaUpgradeName };
export type UpgradeName = CursorUpgradeName | GrandmaUpgradeName;
