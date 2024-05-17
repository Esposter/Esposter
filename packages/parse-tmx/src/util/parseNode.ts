import type { TMXGroupLayerNode } from "@/models/tmx/node/TMXGroupLayerNode";
import type { TMXLayerNode } from "@/models/tmx/node/TMXLayerNode";
import { TMXNodeType } from "@/models/tmx/node/TMXNodeType";
import type { TMXGroupLayerParsed } from "@/models/tmx/parsed/TMXGroupLayerParsed";
import type { TMXLayerParsed } from "@/models/tmx/parsed/TMXLayerParsed";
import { parseGroup } from "@/util/parseGroup";
import { parseLayer } from "@/util/parseLayer";
import { parseTileLayer } from "@/util/parseTileLayer";
import { InvalidOperationError } from "@esposter/shared/models/error/InvalidOperationError";
import { Operation } from "@esposter/shared/models/shared/Operation";

export const parseNode = <
  TNode extends TMXLayerNode | TMXGroupLayerNode,
  TParsedNode = TNode extends TMXLayerNode ? TMXLayerParsed : TMXGroupLayerParsed,
>(
  node: TMXLayerNode | TMXGroupLayerNode,
  expectedCount: number,
  translateFlips: boolean,
): Promise<TParsedNode> | TParsedNode => {
  const tmxNodeType = node["#name"] as TMXNodeType;
  switch (tmxNodeType) {
    case TMXNodeType.Group:
      return parseGroup(node as TMXGroupLayerNode, expectedCount, translateFlips) as Promise<TParsedNode>;
    case TMXNodeType.Layer:
      return parseTileLayer(node as TMXLayerNode, expectedCount, translateFlips) as Promise<TParsedNode>;
    case TMXNodeType.ImageLayer:
    case TMXNodeType.Objectgroup:
      return parseLayer(node as TMXLayerNode) as TParsedNode;
    default:
      throw new InvalidOperationError(Operation.Read, parseNode.name, tmxNodeType);
  }
};
