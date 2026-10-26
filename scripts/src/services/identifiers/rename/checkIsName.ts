import type { SyntaxNode } from "#src/models/syntax/SyntaxNode";

const NAMED_NODE_TYPES = new Set([
  "AccessorProperty",
  "MethodDefinition",
  "Property",
  "PropertyDefinition",
  "TSMethodSignature",
  "TSPropertySignature",
]);

// Whether the identifier is the name a declaration or a key gives, rather than a reference to a binding. A computed
// Key is a reference, so `{ [users]: … }` is renamed
export const checkIsName = (parent: SyntaxNode | undefined, identifier: SyntaxNode): boolean => {
  if (parent?.type === "TSEnumMember") return parent.id === identifier;
  if (parent?.type === "TSQualifiedName") return parent.right === identifier;
  return (
    parent !== undefined &&
    NAMED_NODE_TYPES.has(parent.type) &&
    "key" in parent &&
    parent.key === identifier &&
    !("computed" in parent && parent.computed)
  );
};
