import { Buffer } from "node:buffer";

// A blob's body read whole as UTF-8. Only a textual blob is read this way, since its bytes are small and must be rewritten as a whole
export const readBlobText = async (body: NodeJS.ReadableStream): Promise<string> => {
  const chunks: Buffer[] = [];
  for await (const chunk of body) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
};
