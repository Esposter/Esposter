import { createHmac } from "node:crypto";

// A pairing code's MAC over a challenge's signed text. The page holds the code and the host holds it too, so each can
// Make this and nothing else can; the code itself never crosses until the page has found the host's MAC to be its own
export const getPairingProof = (code: string, text: string): string =>
  createHmac("sha256", code).update(text).digest("base64url");
