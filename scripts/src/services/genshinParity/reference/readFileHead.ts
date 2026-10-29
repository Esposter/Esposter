import { SNIFF_HEAD_LENGTH } from "#src/services/genshinParity/reference/constants";
import { createReadStream } from "node:fs";

// The first bytes of a file, read as a stream so a recording of any size is never read whole to be sniffed
export const readFileHead = async (path: string): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  for await (const chunk of createReadStream(path, { end: SNIFF_HEAD_LENGTH - 1 })) chunks.push(chunk);
  return Buffer.concat(chunks);
};
