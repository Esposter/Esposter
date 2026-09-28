import { z } from "zod";

// What a connection sends before it may send commands. A page answers the host's proof with its credential, or pairs
// With a code; the host's own executable, run again, hands a running host a code or revokes a device
export enum HandshakeMessageType {
  Authenticate = "Authenticate",
  Challenge = "Challenge",
  HandOff = "HandOff",
  Pair = "Pair",
  Revoke = "Revoke",
}

export const handshakeMessageTypeSchema: z.ZodEnum<typeof HandshakeMessageType> = z.enum(
  HandshakeMessageType,
) satisfies z.ZodType<HandshakeMessageType>;
