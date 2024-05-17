import type { TMXNode } from "@/models/tmx/node/TMXNode";
import type { TMXObjectNode } from "@/models/tmx/node/TMXObjectNode";
import type { TMXPropertiesNode } from "@/models/tmx/node/TMXPropertiesNode";
import type { TMXPropertyNode } from "@/models/tmx/node/TMXPropertyNode";
import type { TMXTileShared } from "@/models/tmx/shared/TMXTileShared";

export interface TMXTileNode extends TMXNode<TMXTileShared, TMXPropertiesNode> {
  animation?: Record<string, TMXNode<number>[]>[];
  objectgroup?: Record<string, TMXObjectNode[]>[];
  properties?: { property: TMXPropertyNode[] }[];
}
