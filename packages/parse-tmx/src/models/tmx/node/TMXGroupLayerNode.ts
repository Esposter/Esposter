import type { TMXLayerNode } from "@/models/tmx/node/TMXLayerNode";
import type { TMXNode } from "@/models/tmx/node/TMXNode";
import type { TMXPropertyNode } from "@/models/tmx/node/TMXPropertyNode";
import type { TMXGroupLayerShared } from "@/models/tmx/shared/TMXGroupLayerShared";

export interface TMXGroupLayerNode extends TMXNode<TMXGroupLayerShared, TMXLayerNode> {
  properties?: { property: TMXPropertyNode[] }[];
}
