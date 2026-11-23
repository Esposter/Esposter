import type { ESTree, Reference } from "@oxlint/plugins";

// The parents an export keeps a binding's kind through, so `export { A }` of a binding read as both a type and a value
// Stays a value import
const EXPORT_PARENT_TYPES = new Set(["ExportDefaultDeclaration", "ExportSpecifier", "TSExportAssignment"]);

// A value use that is still only a type's: the operand of `typeof`, and the computed key of a type literal. The
// Member chain under either is walked up to its root, and any other parent makes the use a value
const checkIsTypeOnlyValueUse = (identifier: Reference["identifier"]): boolean | undefined => {
  let child: ESTree.Node = identifier;
  let parent: ESTree.Node | null = identifier.parent;
  while (parent) {
    switch (parent.type) {
      case "TSTypeQuery":
        return true;
      case "TSPropertySignature":
        return parent.key === child;
      case "TSQualifiedName":
        if (parent.left !== child) return false;
        break;
      case "MemberExpression":
        if (parent.object !== child) return false;
        break;
      default:
        return false;
    }
    child = parent;
    parent = parent.parent;
  }
  // The walk ran out of parents before it answered, so the reference's own flag decides
  return undefined;
};

// The plugin types leave out the two flags the scope manager sets on every reference, so they are read off the object
export const checkIsTypeOnlyReference = (reference: Reference): boolean => {
  const isTypeReference = "isTypeReference" in reference && reference.isTypeReference === true;
  const isValueReference = "isValueReference" in reference && reference.isValueReference === true;
  if (isTypeReference && isValueReference && EXPORT_PARENT_TYPES.has(reference.identifier.parent.type)) return false;
  if (!isValueReference) return isTypeReference;
  // The walk leaves `undefined` only when it runs out of parents, where the reference's own type flag is the answer
  return checkIsTypeOnlyValueUse(reference.identifier) ?? isTypeReference;
};
