import { NodeType } from "@/lib/tmxParser/models/NodeType";
import { ParsedTMXTiledMap } from "@/lib/tmxParser/models/tmx/ParsedTMXTiledMap";
import type { TMX } from "@/lib/tmxParser/models/tmx/TMX";
import type { TMXLayer } from "@/lib/tmxParser/models/tmx/TMXLayer";
import type { TMXLayerGroup } from "@/lib/tmxParser/models/tmx/TMXLayerGroup";
import type { TMXNode } from "@/lib/tmxParser/models/tmx/TMXNode";
import type { TMXTileset } from "@/lib/tmxParser/models/tmx/TMXTileset";
import { getAttributes } from "@/lib/tmxParser/util/getAttributes";
import { parseNode } from "@/lib/tmxParser/util/parseNode";
import { parseTileset } from "@/lib/tmxParser/util/parseTileset";
import { parseXmlString } from "@/lib/tmxParser/util/parseXmlString";
import type { TiledObjectProperty } from "@/models/dungeons/tilemap/TiledObjectProperty";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";

export const parseTmx = async (xmlString: string, translateFlips = false): Promise<ParsedTMXTiledMap> => {
  const {
    map: { $, $$ },
  } = (await parseXmlString(xmlString)) as TMX;
  const tmxTiledMap = new ParsedTMXTiledMap(Object.assign({}, ...getAttributes($)));
  const expectedCount = tmxTiledMap.width * tmxTiledMap.height * 4;

  await Promise.all(
    $$.map(async (node, index: number) => {
      const nodeType = node["#name"] as NodeType;
      switch (nodeType) {
        case NodeType.Properties:
          tmxTiledMap.properties = {
            ...(node as unknown as TMXNode<TiledObjectProperty<unknown>>).$$.map(({ $: { name, value } }) => ({
              [name]: value,
            })),
          };
          break;
        case NodeType.EditorSettings:
          tmxTiledMap.editorsettings = { ...node.$$.map((n) => ({ [n["#name"] as string]: n.$ })) };
          break;
        case NodeType.Tileset:
          tmxTiledMap.tilesets.push(parseTileset(node as unknown as TMXNode<TMXTileset>));
          break;
        case NodeType.Group:
        case NodeType.ImageLayer:
        case NodeType.Layer:
        case NodeType.Objectgroup:
          tmxTiledMap.layers[index] = (await parseNode(
            node as unknown as TMXNode<TMXLayer> | TMXNode<TMXLayerGroup>,
            expectedCount,
            translateFlips,
          )) as TMXLayer;
          break;
        case NodeType.Image:
          break;
        default:
          exhaustiveGuard(nodeType);
      }
    }),
  );

  return tmxTiledMap;
};