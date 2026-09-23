import { z } from "zod";

export enum SessionState {
  Closed = "Closed",
  Compacting = "Compacting",
  Idle = "Idle",
  RequiresAction = "RequiresAction",
  Running = "Running",
}

export const sessionStateSchema: z.ZodEnum<typeof SessionState> = z.enum(
  SessionState,
) satisfies z.ZodType<SessionState>;
