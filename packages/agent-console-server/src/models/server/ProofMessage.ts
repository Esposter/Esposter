import type { BaseServerMessage } from "#src/models/server/BaseServerMessage";

import { createBaseServerMessageSchema } from "#src/models/server/BaseServerMessage";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { z } from "zod";

// The host's answer to a challenge: the challenge's nonce signed with the host's key, and a nonce of the host's own,
// Which only its own executable, holding the same key, can sign back
export interface ProofMessage extends BaseServerMessage<ServerMessageType.Proof> {
  nonce: string;
  signature: string;
}

export const proofMessageSchema: z.ZodObject<{
  nonce: z.ZodString;
  signature: z.ZodString;
  type: z.ZodLiteral<ServerMessageType.Proof>;
}> = z.object({
  ...createBaseServerMessageSchema(z.literal(ServerMessageType.Proof)).shape,
  nonce: z.string().min(1),
  signature: z.string().min(1),
}) satisfies z.ZodType<ProofMessage>;
