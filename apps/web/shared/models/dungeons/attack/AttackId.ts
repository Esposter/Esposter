import { z } from "zod";

export const AttackId = {
  "Aqua Jet": "Aqua Jet",
  Bite: "Bite",
  "Frost Fang": "Frost Fang",
  "Ice Shard": "Ice Shard",
  "Shadow Claw": "Shadow Claw",
  Slash: "Slash",
  "Volt Claw": "Volt Claw",
} as const;
export type AttackId = (typeof AttackId)[keyof typeof AttackId];

export const attackIdSchema = z.enum(AttackId) satisfies z.ZodType<AttackId>;
