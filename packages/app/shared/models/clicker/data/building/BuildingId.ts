import { z } from "zod";

export enum BuildingId {
  "Alchemy Lab" = "Alchemy Lab",
  "Antimatter Condenser" = "Antimatter Condenser",
  Bank = "Bank",
  Chancemaker = "Chancemaker",
  "Cortex Baker" = "Cortex Baker",
  Cursor = "Cursor",
  Factory = "Factory",
  Farm = "Farm",
  "Fractal Engine" = "Fractal Engine",
  Grandma = "Grandma",
  Idleverse = "Idleverse",
  "Javascript Console" = "Javascript Console",
  Mine = "Mine",
  Portal = "Portal",
  Prism = "Prism",
  Shipment = "Shipment",
  Temple = "Temple",
  "Time Machine" = "Time Machine",
  "Wizard Tower" = "Wizard Tower",
}

export const buildingIdSchema = z.nativeEnum(BuildingId) satisfies z.ZodType<BuildingId>;
