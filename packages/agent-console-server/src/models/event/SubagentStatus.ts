import { z } from "zod";

export enum SubagentStatus {
  Completed = "Completed",
  Failed = "Failed",
  Running = "Running",
  Started = "Started",
  Stopped = "Stopped",
}

export const subagentStatusSchema: z.ZodEnum<typeof SubagentStatus> = z.enum(
  SubagentStatus,
) satisfies z.ZodType<SubagentStatus>;
