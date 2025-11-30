import type { TMXDataNode } from "@/models/tmx/node/TMXDataNode";
import type { TMXEmbeddedTilesetNode } from "@/models/tmx/node/TMXEmbeddedTilesetNode";
import type { TMXImageNode } from "@/models/tmx/node/TMXImageNode";
import type { TMXNode } from "@/models/tmx/node/TMXNode";
import type { TMXObjectNode } from "@/models/tmx/node/TMXObjectNode";
import type { TMXPropertiesNode } from "@/models/tmx/node/TMXPropertiesNode";
import type { TMXPropertyNode } from "@/models/tmx/node/TMXPropertyNode";
import type { TMXLayerShared } from "@/models/tmx/shared/TMXLayerShared";

export interface TMXLayerNode extends TMXNode<
  TMXLayerShared,
  TMXDataNode | TMXEmbeddedTilesetNode | TMXPropertiesNode
> {
  data?: TMXDataNode[] | TMXEmbeddedTilesetNode[];
  image?: TMXImageNode[];
  object?: TMXObjectNode[];
  properties?: { property: TMXPropertyNode[] }[];
}
