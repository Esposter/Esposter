import { createHash } from "node:crypto";

// The hex SHA-256 of a byte array: the one content address stored bytes are named by, so a hash computed by one caller
// Compares with the name another caller stored them under
export const getContentAddress = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");
