import { z } from "zod";

export enum AttackKey {
  IceShard = "IceShard",
  IceShardStart = "IceShardStart",
  Slash = "Slash",
}

export const attackKeySchema = z.nativeEnum(AttackKey) satisfies z.ZodType<AttackKey>;
