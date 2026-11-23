import { createHash } from "node:crypto";

// An R2 S3 secret access key is the SHA-256 digest of its token's value, in hex.
// Cloudflare's R2 token documentation does not name the encoding, so the change's first signed request confirms it
export const getR2SecretAccessKey = (tokenValue: string): string =>
  createHash("sha256").update(tokenValue).digest("hex");
