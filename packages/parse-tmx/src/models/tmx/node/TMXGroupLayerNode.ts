import type { TMXLayerNode } from "@/src/models/tmx/node/TMXLayerNode";
import type { TMXNode } from "@/src/models/tmx/node/TMXNode";
import type { TMXPropertyNode } from "@/src/models/tmx/node/TMXPropertyNode";
import type { TMXGroupLayerShared } from "@/src/models/tmx/shared/TMXGroupLayerShared";

export interface TMXGroupLayerNode extends TMXNode<TMXGroupLayerShared, TMXLayerNode> {
  properties?: { property: TMXPropertyNode[] }[];
}
