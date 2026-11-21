import type { TMXDataSource } from "#src/internal/models/tmx/TMXDataSource";

import { Compression } from "#src/internal/models/Compression";
import { Encoding } from "#src/internal/models/Encoding";
import { decodeCsv } from "#src/internal/services/decodeCsv";
import { getDecompressedBytes } from "#src/internal/services/getDecompressedBytes";
import { unpackTileBytes } from "#src/internal/services/unpackTileBytes";
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
      return decodeCsv(data);
    default:
      return exhaustiveGuard(encoding);
  }
};
