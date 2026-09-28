import { z } from "zod";

export enum CommandType {
  CloseSession = "CloseSession",
  CloseShell = "CloseShell",
  CreateSession = "CreateSession",
  Fork = "Fork",
  Interrupt = "Interrupt",
  ListSessions = "ListSessions",
  OpenShell = "OpenShell",
  PermissionVerdict = "PermissionVerdict",
  Prompt = "Prompt",
  Resume = "Resume",
  ResumeAt = "ResumeAt",
  RewindFiles = "RewindFiles",
  SetModel = "SetModel",
  SetPermissionMode = "SetPermissionMode",
  ShellInput = "ShellInput",
  ShellResize = "ShellResize",
  SlashCommand = "SlashCommand",
}

export const commandTypeSchema: z.ZodEnum<typeof CommandType> = z.enum(CommandType) satisfies z.ZodType<CommandType>;
