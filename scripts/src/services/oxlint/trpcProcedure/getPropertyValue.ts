import type { ESTree } from "@oxlint/plugins";

// What an object literal's `name:` property is set to, when it is written as a plain key rather than computed.
// Every question this plugin asks of a `TRPCError`'s argument is one of these, so the shape is read once.
export const getPropertyValue = (property: ESTree.Node, name: string): ESTree.Node | undefined => {
  if (property.type !== "Property" || property.computed) return undefined;
  const { key, value } = property;
  return key.type === "Identifier" && key.name === name ? value : undefined;
};
