import type { ESTree } from "@oxlint/plugins";

// The text a string-shaped argument spells: a literal's value, or a template's quasis joined — `${…}` holes are
// Dropped, since what they compute is not typed. Anything else is not a string the rule can read
export const getStringText = (node: ESTree.Expression | ESTree.SpreadElement | undefined): string | undefined => {
  if (node?.type === "Literal" && typeof node.value === "string") return node.value;
  else if (node?.type === "TemplateLiteral") return node.quasis.map((quasi) => quasi.value.raw).join("");
  else return undefined;
};
