import { z } from "zod";

export enum CursorUpgradeId {
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

export const cursorUpgradeIdSchema = z.nativeEnum(CursorUpgradeId) satisfies z.ZodType<CursorUpgradeId>;
