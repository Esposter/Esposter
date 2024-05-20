import type { TMXNode } from "@/models/tmx/node/TMXNode";
import type { TMXPropertyNode } from "@/models/tmx/node/TMXPropertyNode";

export interface TMXPropertiesNode extends TMXNode<Record<string, never>, TMXPropertyNode> {}
