import type { TMXLayerNode } from "@/models/tmx/node/TMXLayerNode";
import type { TMXLayerParsed } from "@/models/tmx/parsed/TMXLayerParsed";

import { Compression } from "@/models/Compression";
import { Encoding } from "@/models/Encoding";
import { isTMXEmbeddedTilesetNode } from "@/util/isTMXEmbeddedTilesetNode";
import { parseFlips } from "@/util/parseFlips";
import { parseProperties } from "@/util/parseProperties";
import { parseTileId } from "@/util/parseTileId";
import { unpackTileBytes } from "@/util/unpackTileBytes";
import { exhaustiveGuard } from "@esposter/shared";
import { gunzip, inflate } from "node:zlib";

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
    // Base64, Csv
    const { $, _ } = nodeData;
    const { compression, encoding } = $;
    const layerData = _.trim();

    switch (encoding) {
      case Encoding.Base64: {
        const buffer = Buffer.from(layerData, encoding);
        switch (compression) {
          case Compression.Gzip:
          case Compression.Zlib:
            {
              const decompress = compression === Compression.Gzip ? gunzip : inflate;
              layer.data = await new Promise((resolve, reject) => {
                decompress(buffer, (err, buf) => {
                  if (err) reject(err);
                  resolve(unpackTileBytes(buf, expectedCount));
                });
              });
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
      case Encoding.Csv:
        layer.data = layerData.split(",").map((d) => parseInt(d));
        break;
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
