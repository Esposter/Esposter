import type { TMXGroupLayerNode } from "#src/models/tmx/node/TMXGroupLayerNode";
import type { TMXLayerNode } from "#src/models/tmx/node/TMXLayerNode";
import type { TMXGroupLayerParsed } from "#src/models/tmx/parsed/TMXGroupLayerParsed";
import type { TMXLayerParsed } from "#src/models/tmx/parsed/TMXLayerParsed";

import { TMXNodeType } from "#src/models/tmx/node/TMXNodeType";
import { cloneNodeWithType } from "#src/services/cloneNodeWithType";
import { parseLayer } from "#src/services/parseLayer";
import { parseTileLayer } from "#src/services/parseTileLayer";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A group holds layers and further groups, so it parses its children back through the node dispatch below
const parseGroup = async (node: TMXGroupLayerNode, tileCount: number, translateFlips: boolean) => {
  const group = cloneNodeWithType<TMXGroupLayerParsed>(node);
  group.layers = await Promise.all(node.$$.map((layerNode) => parseNode(layerNode, tileCount, translateFlips)));
  return group;
};

export const parseNode = <
  TNode extends TMXGroupLayerNode | TMXLayerNode,
  TParsedNode = TNode extends TMXLayerNode ? TMXLayerParsed : TMXGroupLayerParsed,
>(
  node: TNode,
  tileCount: number,
  translateFlips: boolean,
): Promise<TParsedNode> => {
  const tmxNodeType = node["#name"];
  switch (tmxNodeType) {
    case TMXNodeType.Group:
      return parseGroup(node as TMXGroupLayerNode, tileCount, translateFlips) as Promise<TParsedNode>;
    case TMXNodeType.ImageLayer:
    case TMXNodeType.Objectgroup:
      return Promise.resolve(parseLayer(node as TMXLayerNode) as TParsedNode);
    case TMXNodeType.Layer:
      return parseTileLayer(node as TMXLayerNode, tileCount, translateFlips) as Promise<TParsedNode>;
    default:
      throw new InvalidOperationError(Operation.Read, parseNode.name, tmxNodeType);
  }
};
