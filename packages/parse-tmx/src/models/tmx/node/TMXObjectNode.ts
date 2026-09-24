import type { TMXDataNode } from "#src/models/tmx/node/TMXDataNode";
import type { TMXNode } from "#src/models/tmx/node/TMXNode";
import type { TMXPropertiesNode } from "#src/models/tmx/node/TMXPropertiesNode";
import type { TMXPropertiesElement } from "#src/models/tmx/node/TMXPropertiesElement";
import type { TMXTextNode } from "#src/models/tmx/node/TMXTextNode";
import type { TMXObjectShared } from "#src/models/tmx/shared/TMXObjectShared";

export interface TMXObjectNode extends TMXNode<TMXObjectShared, TMXDataNode | TMXPropertiesNode> {
  polygon?: TMXNode<{ points: string }>[];
  properties?: TMXPropertiesElement[];
  text?: TMXTextNode[];
}
