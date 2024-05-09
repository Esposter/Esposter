import type { TMXGroupLayerNode } from "@/lib/tmxParser/models/tmx/node/TMXGroupLayerNode";
import type { TMXLayerNode } from "@/lib/tmxParser/models/tmx/node/TMXLayerNode";
import { TMXNodeType } from "@/lib/tmxParser/models/tmx/node/TMXNodeType";
import type { TMXGroupLayerParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXGroupLayerParsed";
import type { TMXLayerParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXLayerParsed";
import { parseGroup } from "@/lib/tmxParser/util/parseGroup";
import { parseLayer } from "@/lib/tmxParser/util/parseLayer";
import { parseTileLayer } from "@/lib/tmxParser/util/parseTileLayer";
import { InvalidOperationError } from "@/models/error/InvalidOperationError";
import { Operation } from "@/models/shared/Operation";

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
