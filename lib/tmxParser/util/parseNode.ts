import { NodeType } from "@/lib/tmxParser/models/NodeType";
import type { TMXLayer } from "@/lib/tmxParser/models/tmx/TMXLayer";
import type { TMXLayerGroup } from "@/lib/tmxParser/models/tmx/TMXLayerGroup";
import type { TMXNode } from "@/lib/tmxParser/models/tmx/TMXNode";
import { parseGroup } from "@/lib/tmxParser/util/parseGroup";
import { parseLayer } from "@/lib/tmxParser/util/parseLayer";
import { parseTileLayer } from "@/lib/tmxParser/util/parseTileLayer";

export const parseNode = (
  node: TMXNode<TMXLayer> | TMXNode<TMXLayerGroup>,
  expectedCount: number,
  translateFlips: boolean,
): Promise<TMXLayer | TMXLayerGroup> | TMXLayer | null => {
  switch (node["#name"]) {
    case NodeType.Group:
      return parseGroup(node as TMXNode<TMXLayerGroup>, expectedCount, translateFlips);
    case NodeType.Layer:
      return parseTileLayer(node as TMXNode<TMXLayer>, expectedCount, translateFlips);
    case NodeType.ImageLayer:
    case NodeType.Objectgroup:
      return parseLayer(node as TMXNode<TMXLayer>);
  }

  return null;
};
