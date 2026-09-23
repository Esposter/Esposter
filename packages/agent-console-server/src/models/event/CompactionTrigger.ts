import { z } from "zod";

export enum CompactionTrigger {
  Auto = "auto",
  Manual = "manual",
}

export const compactionTriggerSchema: z.ZodEnum<typeof CompactionTrigger> = z.enum(
  CompactionTrigger,
) satisfies z.ZodType<CompactionTrigger>;
