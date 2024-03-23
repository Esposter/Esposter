import { z } from "zod";

export const SpritesheetKey = {
  IceShard: "IceShard",
  IceShardStart: "IceShardStart",
  Slash: "Slash",

  Character: "Character",
  Npc: "Npc",
} as const;
export type SpritesheetKey = keyof typeof SpritesheetKey;

export const spriteSheetKeySchema = z.nativeEnum(SpritesheetKey) satisfies z.ZodType<SpritesheetKey>;
