import { createHash } from "node:crypto";

// The SHA-256 of bytes already in memory, as the manifest records a file's hash
export const sha256Buffer = (data: Buffer): string => createHash("sha256").update(data).digest("hex");
