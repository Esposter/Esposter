import type { TMXLayerNode } from "parse-tmx/models/tmx/node/TMXLayerNode";
import type { TMXNode } from "parse-tmx/models/tmx/node/TMXNode";
import type { TMXPropertyNode } from "parse-tmx/models/tmx/node/TMXPropertyNode";
import type { TMXGroupLayerShared } from "parse-tmx/models/tmx/shared/TMXGroupLayerShared";

export interface TMXGroupLayerNode extends TMXNode<TMXGroupLayerShared, TMXLayerNode> {
  properties?: { property: TMXPropertyNode[] }[];
}
