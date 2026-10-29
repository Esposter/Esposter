import { DIGEST_LENGTH } from "#src/services/genshinParity/reference/constants";
import { sha256File } from "#src/services/genshinParity/reference/sha256File";

// The SHA-256 of a file's bytes, its first digits as the reference cache names it
export const hashFile = async (path: string): Promise<string> => (await sha256File(path)).slice(0, DIGEST_LENGTH);
