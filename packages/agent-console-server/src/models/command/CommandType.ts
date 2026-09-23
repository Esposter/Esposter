import { z } from "zod";

export enum CommandType {
  CloseSession = "CloseSession",
  CreateSession = "CreateSession",
  Fork = "Fork",
  Interrupt = "Interrupt",
  ListSessions = "ListSessions",
  PermissionVerdict = "PermissionVerdict",
  Prompt = "Prompt",
  Resume = "Resume",
  ResumeAt = "ResumeAt",
  SetModel = "SetModel",
  SetPermissionMode = "SetPermissionMode",
  SlashCommand = "SlashCommand",
}

export const commandTypeSchema: z.ZodEnum<typeof CommandType> = z.enum(CommandType) satisfies z.ZodType<CommandType>;
