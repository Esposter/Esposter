import { timingSafeEqual } from "node:crypto";

const LOOPBACK_ADDRESSES = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

// A request is taken only from the loopback and with the token the server printed at start, the sender gate every
// Channel owes: a line from anywhere else never reaches the session
export const checkIsChannelRequestAllowed = (
  remoteAddress: string | undefined,
  presentedToken: string,
  token: string,
): boolean => {
  if (!remoteAddress || !LOOPBACK_ADDRESSES.has(remoteAddress)) return false;

  const presented = Buffer.from(presentedToken);
  const expected = Buffer.from(token);
  return presented.length === expected.length && timingSafeEqual(presented, expected);
};
