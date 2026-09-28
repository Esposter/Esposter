import { createHmac } from "node:crypto";

// The challenge signed by the token: only a process holding the token can produce it, and it gives the token away to
// No one who reads it
export const getHostProof = (challenge: string, token: string): string =>
  createHmac("sha256", token).update(challenge).digest("base64url");
