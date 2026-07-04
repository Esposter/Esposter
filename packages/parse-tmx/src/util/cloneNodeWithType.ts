import type { BaseTMXNode } from "@/models/tmx/node/BaseTMXNode";

// Clone the node's attributes and stamp the parsed type from the xml element name.
export const cloneNodeWithType = <TParsed>(node: BaseTMXNode<unknown>): TParsed => {
  const parsed = structuredClone(node.$) as Record<string, unknown>;
  parsed.type = node["#name"] as string;
  return parsed as TParsed;
};
