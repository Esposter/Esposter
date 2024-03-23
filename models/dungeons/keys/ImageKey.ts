import { z } from "zod";

export const ImageKey = {
  TitleScreenBackground: "TitleScreenBackground",
  TitleTextBackground: "TitleTextBackground",
  TitleText: "TitleText",

  WorldHomeForeground: "WorldHomeForeground",
  BattleForestBackground: "BattleForestBackground",

  HealthBarBackground: "HealthBarBackground",
  HealthBarLeftCap: "HealthBarLeftCap",
  HealthBarMiddle: "HealthBarMiddle",
  HealthBarRightCap: "HealthBarRightCap",
  HealthBarLeftCapShadow: "HealthBarLeftCapShadow",
  HealthBarMiddleShadow: "HealthBarMiddleShadow",
  HealthBarRightCapShadow: "HealthBarRightCapShadow",
  GlassPanel: "GlassPanel",
  GlassPanelGreen: "GlassPanelGreen",
  GlassPanelPurple: "GlassPanelPurple",
  // Monsters
  Carnodusk: "Carnodusk",
  Iguanignite: "Iguanignite",

  Cursor: "Cursor",
  CursorWhite: "CursorWhite",
  Base: "Base",
  Thumb: "Thumb",
} as const;
export type ImageKey = keyof typeof ImageKey;

export const imageKeySchema = z.nativeEnum(ImageKey) satisfies z.ZodType<ImageKey>;
