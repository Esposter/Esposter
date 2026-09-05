import type { TMX } from "#src/models/tmx/node/TMX";
import type { TMXGroupLayerNode } from "#src/models/tmx/node/TMXGroupLayerNode";
import type { TMXLayerNode } from "#src/models/tmx/node/TMXLayerNode";
import type { TMXPropertyNode } from "#src/models/tmx/node/TMXPropertyNode";
import type { TMXTilesetNode } from "#src/models/tmx/node/TMXTilesetNode";

import { TMXNodeType } from "#src/models/tmx/node/TMXNodeType";
import { TMXMapParsed } from "#src/models/tmx/parsed/TMXMapParsed";
import { TMXParsed } from "#src/models/tmx/parsed/TMXParsed";
import { parseNode } from "#src/util/parseNode";
import { parseTileset } from "#src/util/parseTileset";
import { parseXmlString } from "#src/util/parseXmlString";
import { exhaustiveGuard } from "@esposter/shared";
// Matches phaser's tmx => json tilemap export transformation, and additionally supports external tilesets.
export const parseTmx = async (xmlString: string, translateFlips = false): Promise<TMXParsed> => {
  const {
    map: { $, $$ },
  } = await parseXmlString<TMX>(xmlString);
  const map = new TMXMapParsed($);
  const expectedCount = map.width * map.height * 4;

  for (const node of $$) {
    const tmxNodeType = node["#name"];
    switch (tmxNodeType) {
      case TMXNodeType.Data:
        break;
      case TMXNodeType.EditorSettings:
        if (!node.$$) break;
        map.editorsettings = Object.assign({}, ...node.$$.map((n) => ({ [n["#name"]]: n.$ })));
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

  return new TMXParsed(map);
};
