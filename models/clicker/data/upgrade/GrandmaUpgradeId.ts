import { z } from "zod";

export enum GrandmaUpgradeId {
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

export const grandmaUpgradeIdSchema = z.nativeEnum(GrandmaUpgradeId) satisfies z.ZodType<GrandmaUpgradeId>;
