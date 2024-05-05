import type { TMXLayerNode } from "@/lib/tmxParser/models/tmx/node/TMXLayerNode";
import type { TMXNode } from "@/lib/tmxParser/models/tmx/node/TMXNode";
import type { TMXPropertyNode } from "@/lib/tmxParser/models/tmx/node/TMXPropertyNode";
import type { TMXLayerGroupShared } from "@/lib/tmxParser/models/tmx/shared/TMXLayerGroupShared";

export interface TMXLayerGroupNode extends TMXNode<TMXLayerGroupShared, TMXLayerNode> {
  properties?: { property: TMXPropertyNode[] }[];
}
