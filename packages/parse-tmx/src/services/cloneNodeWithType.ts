// oxlint-disable typescript/no-unnecessary-type-parameters -- the caller names the type the parsed input holds
import type { BaseTMXNode } from "#src/models/tmx/node/BaseTMXNode";

export const cloneNodeWithType = <TParsed>(node: BaseTMXNode<unknown>): TParsed => {
  const attributes = structuredClone(node.$) as Record<string, unknown>;
  attributes.type = node["#name"];
  return attributes as TParsed;
};
