import { z } from "zod";

export enum AttackId {
  "Aqua Jet" = "Aqua Jet",
  Bite = "Bite",
  "Frost Fang" = "Frost Fang",
  "Ice Shard" = "Ice Shard",
  "Shadow Claw" = "Shadow Claw",
  Slash = "Slash",
  "Volt Claw" = "Volt Claw",
}

export const attackIdSchema = z.enum(AttackId) satisfies z.ZodType<AttackId>;
