// oxlint-disable typescript/no-unnecessary-type-parameters
import type { BaseTMXNode } from "#src/models/tmx/node/BaseTMXNode";

export const cloneNodeWithType = <TParsed>(node: BaseTMXNode<unknown>): TParsed => {
  const parsed = structuredClone(node.$) as Record<string, unknown>;
  parsed.type = node["#name"];
  return parsed as TParsed;
};
