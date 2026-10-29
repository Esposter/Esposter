import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";

// The SHA-256 of a block's bytes, streamed, so a block is hashed without being held whole
export const hashBlockFile = async (path: string): Promise<string> => {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
};
