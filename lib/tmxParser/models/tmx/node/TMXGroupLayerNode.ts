import type { TMXLayerNode } from "@/lib/tmxParser/models/tmx/node/TMXLayerNode";
import type { TMXNode } from "@/lib/tmxParser/models/tmx/node/TMXNode";
import type { TMXPropertyNode } from "@/lib/tmxParser/models/tmx/node/TMXPropertyNode";
import type { TMXGroupLayerShared } from "@/lib/tmxParser/models/tmx/shared/TMXGroupLayerShared";

export interface TMXGroupLayerNode extends TMXNode<TMXGroupLayerShared, TMXLayerNode> {
  properties?: { property: TMXPropertyNode[] }[];
}
