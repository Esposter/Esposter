import type { TMXLayerGroupNode } from "@/lib/tmxParser/models/tmx/node/TMXLayerGroupNode";
import type { TMXLayerNode } from "@/lib/tmxParser/models/tmx/node/TMXLayerNode";
import { TMXNodeType } from "@/lib/tmxParser/models/tmx/node/TMXNodeType";
import type { TMXLayerGroupParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXLayerGroupParsed";
import type { TMXLayerParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXLayerParsed";
import { parseGroup } from "@/lib/tmxParser/util/parseGroup";
import { parseLayer } from "@/lib/tmxParser/util/parseLayer";
import { parseTileLayer } from "@/lib/tmxParser/util/parseTileLayer";
import { InvalidOperationError } from "@/models/error/InvalidOperationError";
import { Operation } from "@/models/shared/Operation";

export const parseNode = <
  TNode extends TMXLayerNode | TMXLayerGroupNode,
  TParsedNode = TNode extends TMXLayerNode ? TMXLayerParsed : TMXLayerGroupParsed,
>(
  node: TMXLayerNode | TMXLayerGroupNode,
  expectedCount: number,
  translateFlips: boolean,
): Promise<TParsedNode> | TParsedNode => {
  const tmxNodeType = node["#name"] as TMXNodeType;
  switch (tmxNodeType) {
    case TMXNodeType.Group:
      return parseGroup(node as TMXLayerGroupNode, expectedCount, translateFlips) as Promise<TParsedNode>;
    case TMXNodeType.Layer:
      return parseTileLayer(node as TMXLayerNode, expectedCount, translateFlips) as Promise<TParsedNode>;
    case TMXNodeType.ImageLayer:
    case TMXNodeType.Objectgroup:
      return parseLayer(node as TMXLayerNode) as TParsedNode;
    default:
      throw new InvalidOperationError(Operation.Read, parseNode.name, tmxNodeType);
  }
};
