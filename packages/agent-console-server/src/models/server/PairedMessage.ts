import type { BaseServerMessage } from "#src/models/server/BaseServerMessage";

import { createBaseServerMessageSchema } from "#src/models/server/BaseServerMessage";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { z } from "zod";

// A pairing accepted: the page's own credential, the id that revokes it, and the public key every later connect
// Checks the host's proof against
export interface PairedMessage extends BaseServerMessage<ServerMessageType.Paired> {
  credential: string;
  deviceId: string;
  publicKey: string;
}

export const pairedMessageSchema: z.ZodObject<{
  credential: z.ZodString;
  deviceId: z.ZodString;
  publicKey: z.ZodString;
  type: z.ZodLiteral<ServerMessageType.Paired>;
}> = z.object({
  ...createBaseServerMessageSchema(z.literal(ServerMessageType.Paired)).shape,
  credential: z.string().min(1),
  deviceId: z.string().min(1),
  publicKey: z.string().min(1),
}) satisfies z.ZodType<PairedMessage>;
