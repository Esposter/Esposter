import { z } from "zod";

export enum SpritesheetKey {
  IceShard = "IceShard",
  IceShardStart = "IceShardStart",
  Slash = "Slash",

  Character = "Character",
  Npc = "Npc",
}

export const spriteSheetKeySchema = z.nativeEnum(SpritesheetKey) satisfies z.ZodType<SpritesheetKey>;
