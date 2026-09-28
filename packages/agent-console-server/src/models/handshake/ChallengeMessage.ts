import type { BaseHandshakeMessage } from "#src/models/handshake/BaseHandshakeMessage";

import { createBaseHandshakeMessageSchema } from "#src/models/handshake/BaseHandshakeMessage";
import { HandshakeMessageType } from "#src/models/handshake/HandshakeMessageType";
import { z } from "zod";

// A fresh value the host must sign before anything secret is sent to whatever answers on its port
export interface ChallengeMessage extends BaseHandshakeMessage<HandshakeMessageType.Challenge> {
  nonce: string;
}

export const challengeMessageSchema: z.ZodObject<{
  nonce: z.ZodString;
  type: z.ZodLiteral<HandshakeMessageType.Challenge>;
}> = z.object({
  ...createBaseHandshakeMessageSchema(z.literal(HandshakeMessageType.Challenge)).shape,
  nonce: z.string().min(1),
}) satisfies z.ZodType<ChallengeMessage>;
