import { Compression } from "@/lib/tmxParser/models/Compression";
import { Encoding } from "@/lib/tmxParser/models/Encoding";
import type { TMXLayer } from "@/lib/tmxParser/models/tmx/TMXLayer";
import type { TMXNode } from "@/lib/tmxParser/models/tmx/TMXNode";
import type { TMXObject } from "@/lib/tmxParser/models/tmx/TMXObject";
import { getAttributes } from "@/lib/tmxParser/util/getAttributes";
import { getFlattenedProperties } from "@/lib/tmxParser/util/getFlattenedProperties";
import { getFlips } from "@/lib/tmxParser/util/getFlips";
import { getTileId } from "@/lib/tmxParser/util/getTileId";
import { unpackTileBytes } from "@/lib/tmxParser/util/unpackTileBytes";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import { gunzip, inflate } from "zlib";

export const parseTileLayer = async (
  node: TMXNode<TMXLayer>,
  expectedCount: number,
  translateFlips: boolean,
): Promise<TMXLayer> => {
  const { data, properties } = node;
  if (!Array.isArray(data)) throw new Error("TMXLayer data corrupted!");

  const newLayer = Object.assign(
    {
      ...(translateFlips ? { flips: [] } : {}),
      type: node["#name"],
      visible: 1,
      ...getFlattenedProperties(properties),
    },
    ...getAttributes(node.$),
  );
  const { _, $, tile } = data[0];
  // Xml Deprecated
  if (tile) newLayer.data = tile.map(({ $ }: TMXNode<TMXObject>) => $?.gid ?? 0);
  else {
    // Csv, Base64
    const { encoding, compression }: { encoding: Encoding; compression: Compression | null | undefined } = $;
    const layerData = _.trim();

    switch (encoding) {
      case Encoding.Csv:
        newLayer.data = layerData.split(",");
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
