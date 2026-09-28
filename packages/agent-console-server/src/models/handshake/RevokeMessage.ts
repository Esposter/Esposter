import type { BaseHandshakeMessage } from "#src/models/handshake/BaseHandshakeMessage";

import { createBaseHandshakeMessageSchema } from "#src/models/handshake/BaseHandshakeMessage";
import { HandshakeMessageType } from "#src/models/handshake/HandshakeMessageType";
import { z } from "zod";

// `devices --revoke` telling a running host to close the revoked device's socket, signed as a hand-off is
export interface RevokeMessage extends BaseHandshakeMessage<HandshakeMessageType.Revoke> {
  deviceId: string;
  signature: string;
}

export const revokeMessageSchema: z.ZodObject<{
  deviceId: z.ZodString;
  signature: z.ZodString;
  type: z.ZodLiteral<HandshakeMessageType.Revoke>;
}> = z.object({
  ...createBaseHandshakeMessageSchema(z.literal(HandshakeMessageType.Revoke)).shape,
  deviceId: z.string().min(1),
  signature: z.string().min(1),
}) satisfies z.ZodType<RevokeMessage>;
