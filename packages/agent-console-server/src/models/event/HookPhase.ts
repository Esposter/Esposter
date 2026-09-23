import { z } from "zod";

export enum HookPhase {
  Progress = "Progress",
  Response = "Response",
  Started = "Started",
}

export const hookPhaseSchema: z.ZodEnum<typeof HookPhase> = z.enum(HookPhase) satisfies z.ZodType<HookPhase>;
