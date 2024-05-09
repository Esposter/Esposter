import type { TMX } from "@/lib/tmxParser/models/tmx/node/TMX";
import type { TMXGroupLayerNode } from "@/lib/tmxParser/models/tmx/node/TMXGroupLayerNode";
import type { TMXLayerNode } from "@/lib/tmxParser/models/tmx/node/TMXLayerNode";
import { TMXNodeType } from "@/lib/tmxParser/models/tmx/node/TMXNodeType";
import type { TMXPropertyNode } from "@/lib/tmxParser/models/tmx/node/TMXPropertyNode";
import type { TMXTilesetNode } from "@/lib/tmxParser/models/tmx/node/TMXTilesetNode";
import { TMXMapParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXMapParsed";
import type { TMXParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXParsed";
import { parseNode } from "@/lib/tmxParser/util/parseNode";
import { parseTileset } from "@/lib/tmxParser/util/parseTileset";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import { parseXmlString } from "@/util/parseXmlString";
// We will try and match phaser's transform when exporting tmx => json tilemaps
// but also support extra functionality like using external tilesets
export const parseTmx = async (xmlString: string, translateFlips = false): Promise<TMXParsed> => {
  const {
    map: { $, $$ },
  } = (await parseXmlString(xmlString)) as TMX;
  const tmxMapParsed = new TMXMapParsed(structuredClone($));
  const expectedCount = tmxMapParsed.width * tmxMapParsed.height * 4;

  await Promise.all(
    $$.map(async (node) => {
      const tmxNodeType = node["#name"] as TMXNodeType;
      switch (tmxNodeType) {
        case TMXNodeType.EditorSettings:
          if (!node.$$) break;
          tmxMapParsed.editorsettings = { ...node.$$.map((n) => ({ [n["#name"] as TMXNodeType]: n.$ })) };
          break;

        case TMXNodeType.Group:
        case TMXNodeType.ImageLayer:
        case TMXNodeType.Layer:
        case TMXNodeType.Objectgroup:
          {
            const layer = await parseNode(node as TMXLayerNode | TMXGroupLayerNode, expectedCount, translateFlips);
            tmxMapParsed.layers.push(layer);
          }
          break;
        case TMXNodeType.Properties:
          if (!node.$$) break;
          tmxMapParsed.properties = {
            ...(node.$$ as TMXPropertyNode[]).map(({ $: { name, value } }) => ({ [name]: value })),
          };
          break;
        case TMXNodeType.Tileset:
          tmxMapParsed.tilesets.push(parseTileset(node as TMXTilesetNode));
          break;
        case TMXNodeType.Export:
        case TMXNodeType.Image:
        case TMXNodeType.Object:
        case TMXNodeType.Property:
          break;
        default:
          exhaustiveGuard(tmxNodeType);
      }
    }),
  );

  return { map: tmxMapParsed };
};
