import { z } from "zod";

// What a session's window tells the host over the loopback — the driver's callbacks and the replies to the commands
// The host forwards — which the host turns into the page's own messages
export enum ChildMessageType {
  CommandError = "CommandError",
  CommandResult = "CommandResult",
  Events = "Events",
  SessionOpen = "SessionOpen",
  SessionsChange = "SessionsChange",
}

export const childMessageTypeSchema: z.ZodEnum<typeof ChildMessageType> = z.enum(
  ChildMessageType,
) satisfies z.ZodType<ChildMessageType>;
