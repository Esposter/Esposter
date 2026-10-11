import type { TMXDataSource } from "#src/models/tmx/TMXDataSource";

import { Compression } from "#src/models/Compression";
import { Encoding } from "#src/models/Encoding";
import { getDecompressedBytes } from "#src/services/getDecompressedBytes";
import { unpackTileBytes } from "#src/services/unpackTileBytes";
import { exhaustiveGuard, normalizeString } from "@esposter/shared";

// Every form the cells are written in decodes to one gid per cell
export const decodeTileData = async (source: TMXDataSource): Promise<number[]> => {
  const { compression, encoding, gids, text } = source;
  // The form Tiled deprecated, one `<tile>` element per cell, has no encoding and is read as the gids it already holds
  if (encoding === undefined) return gids;

  const data = normalizeString(text);
  switch (encoding) {
    case Encoding.Base64: {
      const bytes = Uint8Array.fromBase64(data);
      switch (compression) {
        case Compression.Gzip:
        case Compression.Zlib:
          return unpackTileBytes(await getDecompressedBytes(bytes, compression));
        case undefined:
          return unpackTileBytes(bytes);
        default:
          return exhaustiveGuard(compression);
      }
    }
    case Encoding.Csv:
      return data.split(",").map(Number);
    default:
      return exhaustiveGuard(encoding);
  }
};
