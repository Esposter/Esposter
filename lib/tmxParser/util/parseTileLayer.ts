import { Compression } from "@/lib/tmxParser/models/Compression";
import { Encoding } from "@/lib/tmxParser/models/Encoding";
import type { TMXDataNode } from "@/lib/tmxParser/models/tmx/node/TMXDataNode";
import type { TMXEmbeddedTilesetNode } from "@/lib/tmxParser/models/tmx/node/TMXEmbeddedTilesetNode";
import type { TMXLayerNode } from "@/lib/tmxParser/models/tmx/node/TMXLayerNode";
import type { TMXLayerParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXLayerParsed";
import { parseFlips } from "@/lib/tmxParser/util/parseFlips";
import { parseProperties } from "@/lib/tmxParser/util/parseProperties";
import { parseTileId } from "@/lib/tmxParser/util/parseTileId";
import { unpackTileBytes } from "@/lib/tmxParser/util/unpackTileBytes";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import { gunzip, inflate } from "zlib";

const isTMXEmbeddedTilesetNode = (node: TMXEmbeddedTilesetNode | TMXDataNode): node is TMXEmbeddedTilesetNode =>
  "tile" in node;

export const parseTileLayer = async (
  node: TMXLayerNode,
  expectedCount: number,
  translateFlips: boolean,
): Promise<TMXLayerParsed> => {
  const { data, properties } = node;
  if (!data) throw new Error("TMXLayer data corrupted!");

  const layer = structuredClone(node.$) as TMXLayerParsed;
  layer.type = node["#name"] as string;
  if (properties) layer.properties = parseProperties(properties);

  const nodeData = data[0];
  // Xml Deprecated
  if (isTMXEmbeddedTilesetNode(nodeData)) layer.data = nodeData.tile?.map(({ $ }) => $.gid ?? 0) ?? [];
  else {
    // Csv, Base64
    const { $, _ } = nodeData;
    const { encoding, compression } = $;
    const layerData = _.trim();

    switch (encoding) {
      case Encoding.Csv:
        layer.data = layerData.split(",").map((d) => parseInt(d));
        break;
      case Encoding.Base64: {
        const buffer = Buffer.from(layerData, encoding);
        switch (compression) {
          case Compression.Gzip:
          case Compression.Zlib:
            {
              const decompress = compression === Compression.Gzip ? gunzip : inflate;
              layer.data = await new Promise((resolve, reject) =>
                decompress(buffer, (err, buf) => {
                  if (err) reject(err);
                  resolve(unpackTileBytes(buf, expectedCount));
                }),
              );
            }
            break;
          case null:
          case undefined:
            layer.data = unpackTileBytes(buffer, expectedCount);
            break;
          default:
            exhaustiveGuard(compression);
        }
        break;
      }
      default:
        exhaustiveGuard(encoding);
    }
  }

  if (translateFlips) {
    layer.flips = [];
    layer.data ??= [];

    for (const gid of layer.data) {
      layer.flips.push(parseFlips(gid));
      layer.data.push(parseTileId(gid));
    }
  }

  return layer;
};
