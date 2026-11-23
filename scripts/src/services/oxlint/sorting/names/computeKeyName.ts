import type { ESTree } from "@oxlint/plugins";

// A key's name when it is an identifier or a literal: an identifier's name, or a literal's value. Any other key has none
export const computeKeyName = (key: ESTree.Node): string | undefined => {
  if (key.type === "Identifier") return key.name;
  if (key.type === "Literal") return String(key.value);
  return undefined;
};
