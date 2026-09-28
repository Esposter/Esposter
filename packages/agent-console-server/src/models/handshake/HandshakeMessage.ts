import type { AuthenticateMessage } from "#src/models/handshake/AuthenticateMessage";
import type { ChallengeMessage } from "#src/models/handshake/ChallengeMessage";
import type { HandOffMessage } from "#src/models/handshake/HandOffMessage";
import type { PairMessage } from "#src/models/handshake/PairMessage";
import type { RevokeMessage } from "#src/models/handshake/RevokeMessage";

import { authenticateMessageSchema } from "#src/models/handshake/AuthenticateMessage";
import { challengeMessageSchema } from "#src/models/handshake/ChallengeMessage";
import { handOffMessageSchema } from "#src/models/handshake/HandOffMessage";
import { pairMessageSchema } from "#src/models/handshake/PairMessage";
import { revokeMessageSchema } from "#src/models/handshake/RevokeMessage";
import { z } from "zod";

export type HandshakeMessage = AuthenticateMessage | ChallengeMessage | HandOffMessage | PairMessage | RevokeMessage;

export const handshakeMessageSchema: z.ZodDiscriminatedUnion<
  [
    typeof authenticateMessageSchema,
    typeof challengeMessageSchema,
    typeof handOffMessageSchema,
    typeof pairMessageSchema,
    typeof revokeMessageSchema,
  ],
  "type"
> = z.discriminatedUnion("type", [
  authenticateMessageSchema,
  challengeMessageSchema,
  handOffMessageSchema,
  pairMessageSchema,
  revokeMessageSchema,
]) satisfies z.ZodType<HandshakeMessage>;
