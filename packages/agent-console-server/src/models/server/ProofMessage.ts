import type { BaseServerMessage } from "#src/models/server/BaseServerMessage";

import { createBaseServerMessageSchema } from "#src/models/server/BaseServerMessage";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { z } from "zod";

// The host's answer to a challenge: the challenge's nonce and the port it answers on, signed with the host's key, and a
// Nonce of the host's own, which only its own executable, holding the same key, can sign back
export interface ProofMessage extends BaseServerMessage<ServerMessageType.Proof> {
  nonce: string;
  port: number;
  signature: string;
}

export const proofMessageSchema: z.ZodObject<{
  nonce: z.ZodString;
  port: z.ZodInt;
  signature: z.ZodString;
  type: z.ZodLiteral<ServerMessageType.Proof>;
}> = z.object({
  ...createBaseServerMessageSchema(z.literal(ServerMessageType.Proof)).shape,
  nonce: z.string().min(1),
  port: z.int(),
  signature: z.string().min(1),
}) satisfies z.ZodType<ProofMessage>;
