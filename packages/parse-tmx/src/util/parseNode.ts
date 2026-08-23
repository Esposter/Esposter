import type { TMXGroupLayerNode } from "#src/models/tmx/node/TMXGroupLayerNode";
import type { TMXLayerNode } from "#src/models/tmx/node/TMXLayerNode";
import type { TMXGroupLayerParsed } from "#src/models/tmx/parsed/TMXGroupLayerParsed";
import type { TMXLayerParsed } from "#src/models/tmx/parsed/TMXLayerParsed";

import { TMXNodeType } from "#src/models/tmx/node/TMXNodeType";
import { parseGroup } from "#src/util/parseGroup";
import { parseLayer } from "#src/util/parseLayer";
import { parseTileLayer } from "#src/util/parseTileLayer";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const parseNode = <
  TNode extends TMXGroupLayerNode | TMXLayerNode,
  TParsedNode = TNode extends TMXLayerNode ? TMXLayerParsed : TMXGroupLayerParsed,
>(
  node: TNode,
  expectedCount: number,
  translateFlips: boolean,
): Promise<TParsedNode> => {
  const tmxNodeType = node["#name"];
  switch (tmxNodeType) {
    case TMXNodeType.Group:
      return parseGroup(node as TMXGroupLayerNode, expectedCount, translateFlips) as Promise<TParsedNode>;
    case TMXNodeType.ImageLayer:
    case TMXNodeType.Objectgroup:
      return Promise.resolve(parseLayer(node as TMXLayerNode) as TParsedNode);
    case TMXNodeType.Layer:
      return parseTileLayer(node as TMXLayerNode, expectedCount, translateFlips) as Promise<TParsedNode>;
    default:
      throw new InvalidOperationError(Operation.Read, parseNode.name, tmxNodeType);
  }
};
