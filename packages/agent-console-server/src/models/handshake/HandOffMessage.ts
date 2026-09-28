import type { BaseHandshakeMessage } from "#src/models/handshake/BaseHandshakeMessage";

import { createBaseHandshakeMessageSchema } from "#src/models/handshake/BaseHandshakeMessage";
import { HandshakeMessageType } from "#src/models/handshake/HandshakeMessageType";
import { z } from "zod";

// A link opened while the host already runs: the second start hands its pairing code to the running host, signing the
// Host's nonce with the key only this user's files hold
export interface HandOffMessage extends BaseHandshakeMessage<HandshakeMessageType.HandOff> {
  code: string;
  signature: string;
}

export const handOffMessageSchema: z.ZodObject<{
  code: z.ZodString;
  signature: z.ZodString;
  type: z.ZodLiteral<HandshakeMessageType.HandOff>;
}> = z.object({
  ...createBaseHandshakeMessageSchema(z.literal(HandshakeMessageType.HandOff)).shape,
  code: z.string().min(1),
  signature: z.string().min(1),
}) satisfies z.ZodType<HandOffMessage>;
