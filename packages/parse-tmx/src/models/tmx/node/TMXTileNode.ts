import type { TMXNode } from "#src/models/tmx/node/TMXNode";
import type { TMXObjectNode } from "#src/models/tmx/node/TMXObjectNode";
import type { TMXPropertiesElement } from "#src/models/tmx/node/TMXPropertiesElement";
import type { TMXPropertiesNode } from "#src/models/tmx/node/TMXPropertiesNode";
import type { TMXTileShared } from "#src/models/tmx/shared/TMXTileShared";

export interface TMXTileNode extends TMXNode<TMXTileShared, TMXPropertiesNode> {
  animation?: Record<string, TMXNode<number>[]>[];
  objectgroup?: Record<string, TMXObjectNode[]>[];
  properties?: TMXPropertiesElement[];
}
