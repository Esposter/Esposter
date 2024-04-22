import { z } from "zod";

export enum AttackId {
  "Ice Shard" = "Ice Shard",
  Slash = "Slash",
}

export const attackIdSchema = z.nativeEnum(AttackId) satisfies z.ZodType<AttackId>;
