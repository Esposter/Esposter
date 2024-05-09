import type { TMXNode } from "@/lib/tmxParser/models/tmx/node/TMXNode";
import type { TMXPropertyNode } from "@/lib/tmxParser/models/tmx/node/TMXPropertyNode";

export interface TMXPropertiesNode extends TMXNode<Record<string, never>, TMXPropertyNode> {}
