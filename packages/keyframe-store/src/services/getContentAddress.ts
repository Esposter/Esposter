import { createHash } from "node:crypto";

// The key an object is stored under: the hex SHA-256 of its plaintext. Keyed on the plaintext rather than on
// The stored bytes so two versions with identical content resolve to one object whichever keyframe either
// Would have been encoded against
export const getContentAddress = (plaintext: Uint8Array): string =>
  createHash("sha256").update(plaintext).digest("hex");
