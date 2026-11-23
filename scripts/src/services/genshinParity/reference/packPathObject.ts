import { readFileHead } from "#src/services/genshinParity/reference/readFileHead";
import { sniffExtension } from "#src/services/genshinParity/reference/sniffExtension";
import { getFileSha256 } from "#src/services/provenance/getFileSha256";
import { stat } from "node:fs/promises";

// A file read for storing: its size, its hash, and the extension its bytes sniff as.
// All three stream the file, so a recording of any size costs one pass over the disk and no memory.
export const packPathObject = async (path: string): Promise<{ bytes: number; extension: string; sha256: string }> => {
  const [{ size }, head, sha256] = await Promise.all([stat(path), readFileHead(path), getFileSha256(path)]);
  return { bytes: size, extension: sniffExtension(head), sha256 };
};
