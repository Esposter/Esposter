import { z } from "zod";

export enum PermissionBehavior {
  Allow = "Allow",
  AllowAlways = "AllowAlways",
  Deny = "Deny",
}

export const permissionBehaviorSchema: z.ZodEnum<typeof PermissionBehavior> = z.enum(
  PermissionBehavior,
) satisfies z.ZodType<PermissionBehavior>;
