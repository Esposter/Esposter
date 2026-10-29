import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";

// The SHA-256 of a file's bytes in full, streamed
export const sha256File = async (path: string): Promise<string> => {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
};
