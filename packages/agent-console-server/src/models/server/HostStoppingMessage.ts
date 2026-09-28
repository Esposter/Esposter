import type { BaseServerMessage } from "#src/models/server/BaseServerMessage";

import { createBaseServerMessageSchema } from "#src/models/server/BaseServerMessage";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { z } from "zod";

// The host was stopped on purpose — its window closed, or Ctrl+C — and is ending its sessions: the page shows it
// Stopped rather than a connection that failed, and does not retry it
export interface HostStoppingMessage extends BaseServerMessage<ServerMessageType.HostStopping> {}

export const hostStoppingMessageSchema: z.ZodObject<{ type: z.ZodLiteral<ServerMessageType.HostStopping> }> = z.object({
  ...createBaseServerMessageSchema(z.literal(ServerMessageType.HostStopping)).shape,
}) satisfies z.ZodType<HostStoppingMessage>;
