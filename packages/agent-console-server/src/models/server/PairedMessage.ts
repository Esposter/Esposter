import type { BaseServerMessage } from "#src/models/server/BaseServerMessage";

import { createBaseServerMessageSchema } from "#src/models/server/BaseServerMessage";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { z } from "zod";

// A pairing accepted: the page's own credential, and the public key every later connect checks the host's proof
// Against
export interface PairedMessage extends BaseServerMessage<ServerMessageType.Paired> {
  credential: string;
  publicKey: string;
}

export const pairedMessageSchema: z.ZodObject<{
  credential: z.ZodString;
  publicKey: z.ZodString;
  type: z.ZodLiteral<ServerMessageType.Paired>;
}> = z.object({
  ...createBaseServerMessageSchema(z.literal(ServerMessageType.Paired)).shape,
  credential: z.string().min(1),
  publicKey: z.string().min(1),
}) satisfies z.ZodType<PairedMessage>;
