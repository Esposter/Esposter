import type { TMX } from "@/models/tmx/node/TMX";
import type { TMXGroupLayerNode } from "@/models/tmx/node/TMXGroupLayerNode";
import type { TMXLayerNode } from "@/models/tmx/node/TMXLayerNode";
import type { TMXPropertyNode } from "@/models/tmx/node/TMXPropertyNode";
import type { TMXTilesetNode } from "@/models/tmx/node/TMXTilesetNode";
import type { TMXParsed } from "@/models/tmx/parsed/TMXParsed";

import { TMXNodeType } from "@/models/tmx/node/TMXNodeType";
import { TMXMapParsed } from "@/models/tmx/parsed/TMXMapParsed";
import { parseNode } from "@/util/parseNode";
import { parseTileset } from "@/util/parseTileset";
import { parseXmlString } from "@/util/parseXmlString";
import { exhaustiveGuard } from "@esposter/shared";
// We will match phaser's tmx => json tilemap export transformation
// but also support extra functionality like using external tilesets
export const parseTmx = async (xmlString: string, translateFlips = false): Promise<TMXParsed> => {
  const {
    map: { $, $$ },
  } = await parseXmlString<TMX>(xmlString);
  const map = new TMXMapParsed($);
  const expectedCount = map.width * map.height * 4;

  for (const node of $$) {
    const tmxNodeType = node["#name"] as TMXNodeType;
    switch (tmxNodeType) {
      case TMXNodeType.Data:
        break;
      case TMXNodeType.EditorSettings:
        if (!node.$$) break;
        map.editorsettings = Object.assign({}, ...node.$$.map((n) => ({ [n["#name"] as TMXNodeType]: n.$ })));
        break;
      case TMXNodeType.Export:
      case TMXNodeType.Image:
      case TMXNodeType.Object:
      case TMXNodeType.Property:
        break;
      case TMXNodeType.Group:
      case TMXNodeType.ImageLayer:
      case TMXNodeType.Layer:
      case TMXNodeType.Objectgroup: {
        const layer = await parseNode(node as TMXGroupLayerNode | TMXLayerNode, expectedCount, translateFlips);
        map.layers.push(layer);
        break;
      }
      case TMXNodeType.Properties:
        if (!node.$$) break;
        map.properties = Object.assign(
          {},
          ...(node.$$ as TMXPropertyNode[]).map(({ $: { name, value } }) => ({ [name]: value })),
        );
        break;
      case TMXNodeType.Tileset:
        map.tilesets.push(parseTileset(node as TMXTilesetNode));
        break;
      default:
        exhaustiveGuard(tmxNodeType);
    }
  }

  return { map };
};
