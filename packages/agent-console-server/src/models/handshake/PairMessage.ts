import type { BaseHandshakeMessage } from "#src/models/handshake/BaseHandshakeMessage";

import { createBaseHandshakeMessageSchema } from "#src/models/handshake/BaseHandshakeMessage";
import { HandshakeMessageType } from "#src/models/handshake/HandshakeMessageType";
import { z } from "zod";

// A page with no credential yet, presenting the one-time code it opened the host with, or that the host's link carried
export interface PairMessage extends BaseHandshakeMessage<HandshakeMessageType.Pair> {
  code: string;
}

export const pairMessageSchema: z.ZodObject<{ code: z.ZodString; type: z.ZodLiteral<HandshakeMessageType.Pair> }> =
  z.object({
    ...createBaseHandshakeMessageSchema(z.literal(HandshakeMessageType.Pair)).shape,
    code: z.string().min(1),
  }) satisfies z.ZodType<PairMessage>;
