import type { TMXLayerNode } from "#src/models/tmx/node/TMXLayerNode";
import type { TMXNode } from "#src/models/tmx/node/TMXNode";
import type { TMXPropertiesElement } from "#src/models/tmx/node/TMXPropertiesElement";
import type { TMXGroupLayerShared } from "#src/models/tmx/shared/TMXGroupLayerShared";

export interface TMXGroupLayerNode extends TMXNode<TMXGroupLayerShared, TMXLayerNode> {
  properties?: TMXPropertiesElement[];
}
