import { z } from "zod";

export enum AttackId {
  IceShard = "IceShard",
  IceShardStart = "IceShardStart",
}

export const attackIdSchema = z.nativeEnum(AttackId) satisfies z.ZodType<AttackId>;
