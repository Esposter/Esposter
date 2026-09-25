import type { TMXDataNode } from "#src/models/tmx/node/TMXDataNode";
import type { TMXEmbeddedTilesetNode } from "#src/models/tmx/node/TMXEmbeddedTilesetNode";

import { Compression } from "#src/models/Compression";
import { Encoding } from "#src/models/Encoding";
import { checkIsTMXEmbeddedTilesetNode } from "#src/services/checkIsTMXEmbeddedTilesetNode";
import { getDecompressedBytes } from "#src/services/getDecompressedBytes";
import { unpackTileBytes } from "#src/services/unpackTileBytes";
import { exhaustiveGuard, normalizeString } from "@esposter/shared";

export const decodeTileData = async (nodeData: TMXDataNode | TMXEmbeddedTilesetNode): Promise<number[]> => {
  // A tile layer written as one `<tile>` element per cell — the form Tiled deprecated in favour of the
  // Encoded ones below, and still reads.
  if (checkIsTMXEmbeddedTilesetNode(nodeData)) return nodeData.tile?.map(({ $ }) => $.gid ?? 0) ?? [];

  const { $, _ } = nodeData;
  const { compression, encoding } = $;
  const layerData = normalizeString(_);

  switch (encoding) {
    case Encoding.Base64: {
      const bytes = Uint8Array.fromBase64(layerData);
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
      return layerData.split(",").map(Number);
    default:
      return exhaustiveGuard(encoding);
  }
};
