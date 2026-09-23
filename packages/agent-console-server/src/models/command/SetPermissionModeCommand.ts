import type { BaseCommand } from "#src/models/command/BaseCommand";
import type { SessionId } from "#src/models/command/SessionId";
import type { PermissionMode } from "#src/models/session/PermissionMode";

import { createBaseCommandSchema } from "#src/models/command/BaseCommand";
import { CommandType } from "#src/models/command/CommandType";
import { sessionIdSchema } from "#src/models/command/SessionId";
import { permissionModeSchema } from "#src/models/session/PermissionMode";
import { z } from "zod";

export interface SetPermissionModeCommand extends BaseCommand<CommandType.SetPermissionMode>, SessionId {
  permissionMode: PermissionMode;
}

export const setPermissionModeCommandSchema: z.ZodObject<{
  id: z.ZodString;
  permissionMode: typeof permissionModeSchema;
  sessionId: z.ZodString;
  type: z.ZodLiteral<CommandType.SetPermissionMode>;
}> = z.object({
  ...createBaseCommandSchema(z.literal(CommandType.SetPermissionMode)).shape,
  ...sessionIdSchema.shape,
  permissionMode: permissionModeSchema,
}) satisfies z.ZodType<SetPermissionModeCommand>;
