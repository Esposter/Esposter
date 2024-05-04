import { Compression } from "@/lib/tmxParser/models/Compression";
import { Encoding } from "@/lib/tmxParser/models/Encoding";
import type { TMXLayer } from "@/lib/tmxParser/models/tmx/TMXLayer";
import type { TMXNode } from "@/lib/tmxParser/models/tmx/TMXNode";
import type { TMXParsedLayer } from "@/lib/tmxParser/models/tmx/TMXParsedLayer";
import { getAttributes } from "@/lib/tmxParser/util/getAttributes";
import { getFlips } from "@/lib/tmxParser/util/getFlips";
import { getTileId } from "@/lib/tmxParser/util/getTileId";
import { parseProperties } from "@/lib/tmxParser/util/parseProperties";
import { unpackTileBytes } from "@/lib/tmxParser/util/unpackTileBytes";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import { gunzip, inflate } from "zlib";

export const parseTileLayer = async (
  node: TMXNode<TMXLayer>,
  expectedCount: number,
  translateFlips: boolean,
): Promise<TMXParsedLayer> => {
  const { data, properties } = node;
  if (!data) throw new Error("TMXLayer data corrupted!");

  const newLayer = Object.assign(
    {
      ...(translateFlips ? { flips: [] } : {}),
      type: node["#name"],
      visible: 1,
      properties: parseProperties(properties),
    },
    ...getAttributes(node.$),
  );
  const { _, $, tile } = data[0];
  // Xml Deprecated
  if (tile) newLayer.data = tile.map(({ $ }) => $.gid);
  else {
    // Csv, Base64
    const { encoding, compression } = $;
    const layerData = (_ as string).trim();

    switch (encoding) {
      case Encoding.Csv:
        newLayer.data = layerData.split(",").map((d) => parseInt(d));
        break;
      case Encoding.Base64: {
        const buffer = Buffer.from(layerData, encoding);
        switch (compression) {
          case Compression.Gzip:
          case Compression.Zlib:
            {
              const decompress = compression === Compression.Gzip ? gunzip : inflate;
              newLayer.data = await new Promise((resolve, reject) =>
                decompress(buffer, (err, buf) => {
                  if (err) reject(err);
                  resolve(unpackTileBytes(buf, expectedCount));
                }),
              );
            }
            break;
          case null:
          case undefined:
            newLayer.data = unpackTileBytes(buffer, expectedCount);
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

  if (translateFlips)
    for (const [index, gid] of (newLayer.data as number[]).entries()) {
      newLayer.flips[index] = getFlips(gid);
      newLayer.data[index] = getTileId(gid);
    }

  return newLayer;
};
