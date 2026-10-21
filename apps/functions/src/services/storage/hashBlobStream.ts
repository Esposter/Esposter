import { createHash } from "node:crypto";

// Hashed as the bytes arrive, so a blob is never held whole in memory
export const hashBlobStream = async (readableStreamBody: NodeJS.ReadableStream): Promise<string> => {
  const hash = createHash("sha256");
  for await (const chunk of readableStreamBody) hash.update(chunk);
  return hash.digest("hex");
};
