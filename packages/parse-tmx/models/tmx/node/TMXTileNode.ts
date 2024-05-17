import type { TMXNode } from "parse-tmx/models/tmx/node/TMXNode";
import type { TMXObjectNode } from "parse-tmx/models/tmx/node/TMXObjectNode";
import type { TMXPropertiesNode } from "parse-tmx/models/tmx/node/TMXPropertiesNode";
import type { TMXPropertyNode } from "parse-tmx/models/tmx/node/TMXPropertyNode";
import type { TMXTileShared } from "parse-tmx/models/tmx/shared/TMXTileShared";

export interface TMXTileNode extends TMXNode<TMXTileShared, TMXPropertiesNode> {
  animation?: Record<string, TMXNode<number>[]>[];
  objectgroup?: Record<string, TMXObjectNode[]>[];
  properties?: { property: TMXPropertyNode[] }[];
}
