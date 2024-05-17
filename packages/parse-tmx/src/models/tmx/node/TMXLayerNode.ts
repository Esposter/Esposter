import type { TMXDataNode } from "@/src/models/tmx/node/TMXDataNode";
import type { TMXEmbeddedTilesetNode } from "@/src/models/tmx/node/TMXEmbeddedTilesetNode";
import type { TMXImageNode } from "@/src/models/tmx/node/TMXImageNode";
import type { TMXNode } from "@/src/models/tmx/node/TMXNode";
import type { TMXObjectNode } from "@/src/models/tmx/node/TMXObjectNode";
import type { TMXPropertiesNode } from "@/src/models/tmx/node/TMXPropertiesNode";
import type { TMXPropertyNode } from "@/src/models/tmx/node/TMXPropertyNode";
import type { TMXLayerShared } from "@/src/models/tmx/shared/TMXLayerShared";

export interface TMXLayerNode
  extends TMXNode<TMXLayerShared, TMXEmbeddedTilesetNode | TMXDataNode | TMXPropertiesNode> {
  data?: TMXEmbeddedTilesetNode[] | TMXDataNode[];
  image?: TMXImageNode[];
  object?: TMXObjectNode[];
  properties?: { property: TMXPropertyNode[] }[];
}
