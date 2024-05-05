import type { TMXDataNode } from "@/lib/tmxParser/models/tmx/node/TMXDataNode";
import type { TMXEmbeddedTilesetNode } from "@/lib/tmxParser/models/tmx/node/TMXEmbeddedTilesetNode";
import type { TMXImageNode } from "@/lib/tmxParser/models/tmx/node/TMXImageNode";
import type { TMXNode } from "@/lib/tmxParser/models/tmx/node/TMXNode";
import type { TMXObjectNode } from "@/lib/tmxParser/models/tmx/node/TMXObjectNode";
import type { TMXPropertiesNode } from "@/lib/tmxParser/models/tmx/node/TMXPropertiesNode";
import type { TMXPropertyNode } from "@/lib/tmxParser/models/tmx/node/TMXPropertyNode";
import type { TMXLayerShared } from "@/lib/tmxParser/models/tmx/shared/TMXLayerShared";

export interface TMXLayerNode
  extends TMXNode<TMXLayerShared, TMXEmbeddedTilesetNode | TMXDataNode | TMXPropertiesNode> {
  data?: TMXEmbeddedTilesetNode[] | TMXDataNode[];
  image?: TMXImageNode[];
  object?: TMXObjectNode[];
  properties?: { property: TMXPropertyNode[] }[];
}
