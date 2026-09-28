import type { BaseServerMessage } from "#src/models/server/BaseServerMessage";

import { createBaseServerMessageSchema } from "#src/models/server/BaseServerMessage";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { z } from "zod";

// A credential accepted: the replay and the live stream follow
export interface AuthenticatedMessage extends BaseServerMessage<ServerMessageType.Authenticated> {}

export const authenticatedMessageSchema: z.ZodObject<{ type: z.ZodLiteral<ServerMessageType.Authenticated> }> =
  z.object({
    ...createBaseServerMessageSchema(z.literal(ServerMessageType.Authenticated)).shape,
  }) satisfies z.ZodType<AuthenticatedMessage>;
