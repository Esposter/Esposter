import type { BaseCommand } from "#src/models/command/BaseCommand";
import type { PermissionBehavior } from "#src/models/command/PermissionBehavior";
import type { SessionId } from "#src/models/command/SessionId";

import { createBaseCommandSchema } from "#src/models/command/BaseCommand";
import { CommandType } from "#src/models/command/CommandType";
import { permissionBehaviorSchema } from "#src/models/command/PermissionBehavior";
import { sessionIdSchema } from "#src/models/command/SessionId";
import { z } from "zod";

export interface PermissionVerdictCommand extends BaseCommand<CommandType.PermissionVerdict>, SessionId {
  behavior: PermissionBehavior;
  // What Claude is told on a deny, empty for the SDK's own wording
  message: string;
  requestId: string;
}

export const permissionVerdictCommandSchema: z.ZodObject<{
  behavior: typeof permissionBehaviorSchema;
  id: z.ZodString;
  message: z.ZodString;
  requestId: z.ZodString;
  sessionId: z.ZodString;
  type: z.ZodLiteral<CommandType.PermissionVerdict>;
}> = z.object({
  ...createBaseCommandSchema(z.literal(CommandType.PermissionVerdict)).shape,
  ...sessionIdSchema.shape,
  behavior: permissionBehaviorSchema,
  message: z.string(),
  requestId: z.string().min(1),
}) satisfies z.ZodType<PermissionVerdictCommand>;
