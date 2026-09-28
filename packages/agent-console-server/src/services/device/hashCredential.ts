import { createHash } from "node:crypto";

// A credential is random bytes, not a password, so a plain hash is enough: nothing shorter than the credential itself
// Finds one that matches
export const hashCredential = (credential: string): string =>
  createHash("sha256").update(credential).digest("base64url");
