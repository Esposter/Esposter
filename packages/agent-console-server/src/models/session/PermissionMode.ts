import { z } from "zod";

export enum PermissionMode {
  AcceptEdits = "acceptEdits",
  Auto = "auto",
  BypassPermissions = "bypassPermissions",
  Default = "default",
  DontAsk = "dontAsk",
  Plan = "plan",
}

export const permissionModeSchema: z.ZodEnum<typeof PermissionMode> = z.enum(
  PermissionMode,
) satisfies z.ZodType<PermissionMode>;
