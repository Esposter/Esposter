import { z } from "zod";

export enum ServerMessageType {
  CommandError = "CommandError",
  Events = "Events",
  SessionOpened = "SessionOpened",
  SessionReset = "SessionReset",
  Sessions = "Sessions",
}

export const serverMessageTypeSchema: z.ZodEnum<typeof ServerMessageType> = z.enum(
  ServerMessageType,
) satisfies z.ZodType<ServerMessageType>;
