import type { TMXNode } from "@/src/models/tmx/node/TMXNode";
import type { TMXObjectNode } from "@/src/models/tmx/node/TMXObjectNode";
import type { TMXPropertiesNode } from "@/src/models/tmx/node/TMXPropertiesNode";
import type { TMXPropertyNode } from "@/src/models/tmx/node/TMXPropertyNode";
import type { TMXTileShared } from "@/src/models/tmx/shared/TMXTileShared";

export interface TMXTileNode extends TMXNode<TMXTileShared, TMXPropertiesNode> {
  animation?: Record<string, TMXNode<number>[]>[];
  objectgroup?: Record<string, TMXObjectNode[]>[];
  properties?: { property: TMXPropertyNode[] }[];
}
