import type { ParsedObject } from "#src/models/ParsedObject";

import { promisify } from "node:util";
import { constants, zstdDecompress } from "node:zlib";

const decompress = promisify(zstdDecompress);

// Decompresses a parsed object, with the base's plaintext as the dictionary for a delta. The window the
// Encoder recorded is what admits the frame: zstd refuses one whose window exceeds the decompressor's declared
// Maximum, so a decoder that had to guess would either guess high on every read or fail on a legal frame
export const decodeObject = (parsedObject: ParsedObject, basePlaintext?: Uint8Array): Promise<Buffer> =>
  decompress(parsedObject.payload, {
    ...(basePlaintext ? { dictionary: basePlaintext } : {}),
    params: { [constants.ZSTD_d_windowLogMax]: parsedObject.windowLog },
  });
