import type { TMXDataNode } from "@/models/tmx/node/TMXDataNode";
import type { TMXNode } from "@/models/tmx/node/TMXNode";
import type { TMXPropertiesNode } from "@/models/tmx/node/TMXPropertiesNode";
import type { TMXPropertyNode } from "@/models/tmx/node/TMXPropertyNode";
import type { TMXObjectShared } from "@/models/tmx/shared/TMXObjectShared";

export interface TMXObjectNode extends TMXNode<TMXObjectShared, TMXDataNode | TMXPropertiesNode> {
  polygon?: TMXNode<{ points: string }>[];
  properties?: { property: TMXPropertyNode[] }[];
  text?: TMXDataNode[];
}
