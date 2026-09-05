import type { TMXLayerNode } from "#src/models/tmx/node/TMXLayerNode";
import type { TMXLayerParsed } from "#src/models/tmx/parsed/TMXLayerParsed";

import { Compression } from "#src/models/Compression";
import { Encoding } from "#src/models/Encoding";
import { checkIsTMXEmbeddedTilesetNode } from "#src/util/checkIsTMXEmbeddedTilesetNode";
import { cloneNodeWithType } from "#src/util/cloneNodeWithType";
import { getDecompressedBytes } from "#src/util/getDecompressedBytes";
import { parseFlips } from "#src/util/parseFlips";
import { parseProperties } from "#src/util/parseProperties";
import { parseTileId } from "#src/util/parseTileId";
import { unpackTileBytes } from "#src/util/unpackTileBytes";
import { exhaustiveGuard, InvalidOperationError, normalizeString, Operation, takeOne } from "@esposter/shared";

export const parseTileLayer = async (
  node: TMXLayerNode,
  expectedCount: number,
  translateFlips: boolean,
): Promise<TMXLayerParsed> => {
  const { data, properties } = node;
  if (!data) throw new InvalidOperationError(Operation.Read, "TMXLayer", "data is missing");

  const layer = cloneNodeWithType<TMXLayerParsed>(node);
  if (properties) layer.properties = parseProperties(properties);

  const nodeData = takeOne(data);
  // A tile layer written as one `<tile>` element per cell — the form Tiled deprecated in favour of the
  // Encoded ones below, and still reads.
  if (checkIsTMXEmbeddedTilesetNode(nodeData)) layer.data = nodeData.tile?.map(({ $ }) => $.gid ?? 0) ?? [];
  else {
    const { $, _ } = nodeData;
    const { compression, encoding } = $;
    const layerData = normalizeString(_);

    switch (encoding) {
      case Encoding.Base64: {
        const bytes = Uint8Array.fromBase64(layerData);
        switch (compression) {
          case Compression.Gzip:
          case Compression.Zlib:
            layer.data = unpackTileBytes(await getDecompressedBytes(bytes, compression), expectedCount);
            break;
          case undefined:
            layer.data = unpackTileBytes(bytes, expectedCount);
            break;
          default:
            exhaustiveGuard(compression);
        }
        break;
      }
      case Encoding.Csv:
        layer.data = layerData.split(",").map(Number);
        break;
      default:
        exhaustiveGuard(encoding);
    }
  }

  if (translateFlips) {
    layer.data ??= [];
    layer.flips = layer.data.map((gid) => parseFlips(gid));
    layer.data = layer.data.map((gid) => parseTileId(gid));
  }

  return layer;
};
