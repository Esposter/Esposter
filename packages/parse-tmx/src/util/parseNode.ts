import type { TMXGroupLayerNode } from "@/models/tmx/node/TMXGroupLayerNode";
import type { TMXLayerNode } from "@/models/tmx/node/TMXLayerNode";
import type { TMXGroupLayerParsed } from "@/models/tmx/parsed/TMXGroupLayerParsed";
import type { TMXLayerParsed } from "@/models/tmx/parsed/TMXLayerParsed";

import { TMXNodeType } from "@/models/tmx/node/TMXNodeType";
import { parseGroup } from "@/util/parseGroup";
import { parseLayer } from "@/util/parseLayer";
import { parseTileLayer } from "@/util/parseTileLayer";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const parseNode = <
  TNode extends TMXGroupLayerNode | TMXLayerNode,
  TParsedNode = TNode extends TMXLayerNode ? TMXLayerParsed : TMXGroupLayerParsed,
>(
  node: TNode,
  expectedCount: number,
  translateFlips: boolean,
): Promise<TParsedNode> | TParsedNode => {
  const tmxNodeType = node["#name"] as TMXNodeType;
  switch (tmxNodeType) {
    case TMXNodeType.Group:
      return parseGroup(node as TMXGroupLayerNode, expectedCount, translateFlips) as Promise<TParsedNode>;
    case TMXNodeType.ImageLayer:
    case TMXNodeType.Objectgroup:
      return parseLayer(node as TMXLayerNode) as TParsedNode;
    case TMXNodeType.Layer:
      return parseTileLayer(node as TMXLayerNode, expectedCount, translateFlips) as Promise<TParsedNode>;
    default:
      throw new InvalidOperationError(Operation.Read, parseNode.name, tmxNodeType);
  }
};
