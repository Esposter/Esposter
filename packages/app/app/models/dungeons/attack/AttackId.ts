import { z } from "zod/v4";

export enum AttackId {
  "Ice Shard" = "Ice Shard",
  Slash = "Slash",
}

export const attackIdSchema = z.enum(AttackId) satisfies z.ZodType<AttackId>;
