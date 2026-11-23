import type { ESTree, SourceCode } from "@oxlint/plugins";

// A signature's trailing `,` or `;` is no part of its name
const formatName = (text: string): string => text.replace(/[,;]$/u, "");

// The name an interface or type literal member sorts by: an identifier's name or a literal key's value.
// Any other key, and an index signature, sorts by the source text it is written with.
export const computeTypeMemberName = (
  node: ESTree.TSIndexSignature | ESTree.TSMethodSignature | ESTree.TSPropertySignature,
  sourceCode: SourceCode,
): string => {
  if (node.type === "TSIndexSignature")
    return formatName(sourceCode.text.slice(node.range[0], node.typeAnnotation?.range[0] ?? node.range[1]));
  if (node.type === "TSMethodSignature") {
    if (node.key.type === "Literal") return String(node.key.value);
    return node.key.type === "Identifier" ? node.key.name : formatName(sourceCode.getText(node));
  }
  if (node.key.type === "Identifier") return node.key.name;
  if (node.key.type === "Literal") return String(node.key.value);
  const end = node.typeAnnotation?.range[0] ?? node.range[1] - (node.optional ? 1 : 0);
  return sourceCode.text.slice(node.range[0], end);
};
