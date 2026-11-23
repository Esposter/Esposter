import { DIGEST_LENGTH } from "#src/services/genshinParity/reference/constants";
import { getFileSha256 } from "#src/services/provenance/getFileSha256";

// The SHA-256 of a file's bytes, its first digits as the reference cache names it
export const hashFile = async (path: string): Promise<string> => (await getFileSha256(path)).slice(0, DIGEST_LENGTH);
