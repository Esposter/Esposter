import type { TMXNode } from "@/src/models/tmx/node/TMXNode";
import type { TMXPropertyNode } from "@/src/models/tmx/node/TMXPropertyNode";

export interface TMXPropertiesNode extends TMXNode<Record<string, never>, TMXPropertyNode> {}
