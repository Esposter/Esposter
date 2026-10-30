import { readFileHead } from "#src/services/genshinParity/reference/readFileHead";
import { sha256File } from "#src/services/genshinParity/reference/sha256File";
import { sniffExtension } from "#src/services/genshinParity/reference/sniffExtension";
import { stat } from "node:fs/promises";

// A file read for storing: its size, its hash, and the extension its bytes sniff as.
// All three stream the file, so a recording of any size costs one pass over the disk and no memory.
export const packPathObject = async (path: string): Promise<{ bytes: number; extension: string; sha256: string }> => {
  const [{ size }, head, sha256] = await Promise.all([stat(path), readFileHead(path), sha256File(path)]);
  return { bytes: size, extension: sniffExtension(head), sha256 };
};
