import { z } from "zod";

export enum ServerMessageType {
  Authenticated = "Authenticated",
  CommandError = "CommandError",
  Events = "Events",
  HostStopping = "HostStopping",
  Paired = "Paired",
  Proof = "Proof",
  SessionOpened = "SessionOpened",
  SessionReset = "SessionReset",
  Sessions = "Sessions",
}

export const serverMessageTypeSchema: z.ZodEnum<typeof ServerMessageType> = z.enum(
  ServerMessageType,
) satisfies z.ZodType<ServerMessageType>;
