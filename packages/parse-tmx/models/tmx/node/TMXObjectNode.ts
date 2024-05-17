import type { TMXDataNode } from "parse-tmx/models/tmx/node/TMXDataNode";
import type { TMXNode } from "parse-tmx/models/tmx/node/TMXNode";
import type { TMXPropertiesNode } from "parse-tmx/models/tmx/node/TMXPropertiesNode";
import type { TMXPropertyNode } from "parse-tmx/models/tmx/node/TMXPropertyNode";
import type { TMXObjectShared } from "parse-tmx/models/tmx/shared/TMXObjectShared";

export interface TMXObjectNode extends TMXNode<TMXObjectShared, TMXDataNode | TMXPropertiesNode> {
  polygon?: TMXNode<{ points: string }>[];
  text?: TMXDataNode[];
  properties?: { property: TMXPropertyNode[] }[];
}
