import { createHash } from "node:crypto";

// A participant is addressed by their key value, hashed only because a rowKey cannot hold arbitrary text —
// An email address carries characters Azure forbids in a key. Hashing leaks nothing the row does not already
// Store in plain text, and it makes the insert itself the uniqueness check
export const getProgramParticipantId = (keyValue: string): string =>
  createHash("sha256").update(keyValue).digest("hex");
