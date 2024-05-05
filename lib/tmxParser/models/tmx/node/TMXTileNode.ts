import type { TMXNode } from "@/lib/tmxParser/models/tmx/node/TMXNode";
import type { TMXObjectNode } from "@/lib/tmxParser/models/tmx/node/TMXObjectNode";
import type { TMXPropertiesNode } from "@/lib/tmxParser/models/tmx/node/TMXPropertiesNode";
import type { TMXPropertyNode } from "@/lib/tmxParser/models/tmx/node/TMXPropertyNode";
import type { TMXTileShared } from "@/lib/tmxParser/models/tmx/shared/TMXTileShared";

export interface TMXTileNode extends TMXNode<TMXTileShared, TMXPropertiesNode> {
  animation?: Record<string, TMXNode<number>[]>[];
  objectgroup?: Record<string, TMXObjectNode[]>[];
  properties?: { property: TMXPropertyNode[] }[];
}
