import { Operation } from "@/models/shared/Operation";
import type { TMXGroupLayer~/packages/shared/models/shared/Operation/tmx/node/TMXGroupLayerNode";
import type { TMXLayerNode } from "@/src/models/tmx/node/TMXLayerNode";
import { TMXNodeType } from "@/src/models/tmx/node/TMXNodeType";
import type { TMXGroupLayerParsed } from "@/src/models/tmx/parsed/TMXGroupLayerParsed";
import type { TMXLayerParsed } from "@/src/models/tmx/parsed/TMXLayerParsed";
import { parseGroup } from "@/src/util/parseGroup";
import { parseLayer } from "@/src/util/parseLayer";
import { parseTileLayer } from "@/src/util/parseTileLayer";
import { InvalidOperationError } from "~/packages/shared/models/error/InvalidOperationError";

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
