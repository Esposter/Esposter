import { createHash } from "node:crypto";

// The hex SHA-256 of a string or a byte array: the one content address stored bytes are named by.
// So a hash computed by one caller compares with the name another caller stored them under
export const getContentAddress = (bytes: string | Uint8Array): string =>
  createHash("sha256").update(bytes).digest("hex");
