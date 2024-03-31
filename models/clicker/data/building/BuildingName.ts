import { z } from "zod";

export enum BuildingName {
  Cursor = "Cursor",
  Grandma = "Grandma",
  Farm = "Farm",
  Mine = "Mine",
  Factory = "Factory",
  Bank = "Bank",
  Temple = "Temple",
  "Wizard Tower" = "Wizard Tower",
  Shipment = "Shipment",
  "Alchemy Lab" = "Alchemy Lab",
  Portal = "Portal",
  "Time Machine" = "Time Machine",
  "Antimatter Condenser" = "Antimatter Condenser",
  Prism = "Prism",
  Chancemaker = "Chancemaker",
  "Fractal Engine" = "Fractal Engine",
  "Javascript Console" = "Javascript Console",
  Idleverse = "Idleverse",
  "Cortex Baker" = "Cortex Baker",
}

export const buildingNameSchema = z.nativeEnum(BuildingName) satisfies z.ZodType<BuildingName>;
