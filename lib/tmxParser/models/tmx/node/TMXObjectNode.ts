import type { TMXDataNode } from "@/lib/tmxParser/models/tmx/node/TMXDataNode";
import type { TMXNode } from "@/lib/tmxParser/models/tmx/node/TMXNode";
import type { TMXPropertiesNode } from "@/lib/tmxParser/models/tmx/node/TMXPropertiesNode";
import type { TMXPropertyNode } from "@/lib/tmxParser/models/tmx/node/TMXPropertyNode";
import type { TMXObjectShared } from "@/lib/tmxParser/models/tmx/shared/TMXObjectShared";

export interface TMXObjectNode extends TMXNode<TMXObjectShared, TMXDataNode | TMXPropertiesNode> {
  polygon?: TMXNode<{ points: string }>[];
  text?: TMXDataNode[];
  properties?: { property: TMXPropertyNode[] }[];
}
