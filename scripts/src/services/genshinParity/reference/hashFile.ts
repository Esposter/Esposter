import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";

const DIGEST_LENGTH = 16;

// The SHA-256 of a file's bytes, streamed, its first digits as the reference cache names it
export const hashFile = async (path: string): Promise<string> => {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex").slice(0, DIGEST_LENGTH);
};
