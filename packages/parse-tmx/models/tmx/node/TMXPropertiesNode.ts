import type { TMXNode } from "parse-tmx/models/tmx/node/TMXNode";
import type { TMXPropertyNode } from "parse-tmx/models/tmx/node/TMXPropertyNode";

export interface TMXPropertiesNode extends TMXNode<Record<string, never>, TMXPropertyNode> {}
