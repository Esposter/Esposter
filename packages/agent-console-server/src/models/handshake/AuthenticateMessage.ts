import type { BaseHandshakeMessage } from "#src/models/handshake/BaseHandshakeMessage";

import { createBaseHandshakeMessageSchema } from "#src/models/handshake/BaseHandshakeMessage";
import { HandshakeMessageType } from "#src/models/handshake/HandshakeMessageType";
import { z } from "zod";

// A paired page's credential, sent only once the host has signed the page's challenge
export interface AuthenticateMessage extends BaseHandshakeMessage<HandshakeMessageType.Authenticate> {
  credential: string;
}

export const authenticateMessageSchema: z.ZodObject<{
  credential: z.ZodString;
  type: z.ZodLiteral<HandshakeMessageType.Authenticate>;
}> = z.object({
  ...createBaseHandshakeMessageSchema(z.literal(HandshakeMessageType.Authenticate)).shape,
  credential: z.string().min(1),
}) satisfies z.ZodType<AuthenticateMessage>;
