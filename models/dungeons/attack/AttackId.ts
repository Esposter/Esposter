import { z } from "zod";

export enum AttackId {
  IceShard = "IceShard",
  Slash = "Slash",
}

export const attackIdSchema = z.nativeEnum(AttackId) satisfies z.ZodType<AttackId>;
