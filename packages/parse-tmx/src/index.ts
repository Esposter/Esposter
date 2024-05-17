import type { TMX } from "@/models/tmx/node/TMX";
import type { TMXGroupLayerNode } from "@/models/tmx/node/TMXGroupLayerNode";
import type { TMXLayerNode } from "@/models/tmx/node/TMXLayerNode";
import { TMXNodeType } from "@/models/tmx/node/TMXNodeType";
import type { TMXPropertyNode } from "@/models/tmx/node/TMXPropertyNode";
import type { TMXTilesetNode } from "@/models/tmx/node/TMXTilesetNode";
import { TMXMapParsed } from "@/models/tmx/parsed/TMXMapParsed";
import type { TMXParsed } from "@/models/tmx/parsed/TMXParsed";
import { parseNode } from "@/util/parseNode";
import { parseTileset } from "@/util/parseTileset";
import { parseXmlString } from "@esposter/shared/util/parseXmlString";
import { exhaustiveGuard } from "@esposter/shared/util/validation/exhaustiveGuard";
// We will try and match phaser's transform when exporting tmx => json tilemaps
// but also support extra functionality like using external tilesets
export const parseTmx = async (xmlString: string, translateFlips = false): Promise<TMXParsed> => {
  const {
    map: { $, $$ },
  } = (await parseXmlString(xmlString)) as TMX;
  const map = new TMXMapParsed(structuredClone($));
  const expectedCount = map.width * map.height * 4;

  await Promise.all(
    $$.map(async (node) => {
      const tmxNodeType = node["#name"] as TMXNodeType;
      switch (tmxNodeType) {
        case TMXNodeType.EditorSettings:
          if (!node.$$) break;
          map.editorsettings = { ...node.$$.map((n) => ({ [n["#name"] as TMXNodeType]: n.$ })) };
          break;
        case TMXNodeType.Group:
        case TMXNodeType.ImageLayer:
        case TMXNodeType.Layer:
        case TMXNodeType.Objectgroup:
          {
            const layer = await parseNode(
              node as unknown as TMXLayerNode | TMXGroupLayerNode,
              expectedCount,
              translateFlips,
            );
            map.layers.push(layer);
          }
          break;
        case TMXNodeType.Properties:
          if (!node.$$) break;
          map.properties = {
            ...(node.$$ as TMXPropertyNode[]).map(({ $: { name, value } }) => ({ [name]: value })),
          };
          break;
        case TMXNodeType.Tileset:
          map.tilesets.push(parseTileset(node as TMXTilesetNode));
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

  return { map };
};

export * from "@/util";
