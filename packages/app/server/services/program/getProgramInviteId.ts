import { createHash } from "node:crypto";

// A recipient's invite is addressed by their key value, hashed only because a rowKey cannot hold arbitrary
// Text — an email address carries characters Azure forbids in a key. Hashing leaks nothing the row does not
// Already store in plain text, and it makes the insert itself the uniqueness check
export const getProgramInviteId = (keyValue: string): string => createHash("sha256").update(keyValue).digest("hex");
