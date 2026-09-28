import { createHmac } from "node:crypto";

// The challenge signed by the token together with the port the host answers on: only a process holding the token can
// Produce it, it gives the token away to no one who reads it, and a program on another port that relays the challenge
// To a host gets back a proof for that host's port rather than its own
export const getHostProof = (challenge: string, port: number, token: string): string =>
  createHmac("sha256", token).update(`${port}:${challenge}`).digest("base64url");
