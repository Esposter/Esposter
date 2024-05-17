import type { TMXDataNode } from "parse-tmx/models/tmx/node/TMXDataNode";
import type { TMXEmbeddedTilesetNode } from "parse-tmx/models/tmx/node/TMXEmbeddedTilesetNode";
import type { TMXImageNode } from "parse-tmx/models/tmx/node/TMXImageNode";
import type { TMXNode } from "parse-tmx/models/tmx/node/TMXNode";
import type { TMXObjectNode } from "parse-tmx/models/tmx/node/TMXObjectNode";
import type { TMXPropertiesNode } from "parse-tmx/models/tmx/node/TMXPropertiesNode";
import type { TMXPropertyNode } from "parse-tmx/models/tmx/node/TMXPropertyNode";
import type { TMXLayerShared } from "parse-tmx/models/tmx/shared/TMXLayerShared";

export interface TMXLayerNode
  extends TMXNode<TMXLayerShared, TMXEmbeddedTilesetNode | TMXDataNode | TMXPropertiesNode> {
  data?: TMXEmbeddedTilesetNode[] | TMXDataNode[];
  image?: TMXImageNode[];
  object?: TMXObjectNode[];
  properties?: { property: TMXPropertyNode[] }[];
}
