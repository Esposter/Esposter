import type { SortingGroupItem } from "#src/models/oxlint/sorting/SortingGroupItem";
import type { Context, ESTree, Reference } from "@oxlint/plugins";

import { checkIsFunctionProperty } from "#src/services/oxlint/sorting/checkIsFunctionProperty";
import { checkIsRangeContaining } from "#src/services/oxlint/sorting/checkIsRangeContaining";
import { collectReadNames } from "#src/services/oxlint/sorting/collectReadNames";

type ClassElement = ESTree.AccessorProperty | ESTree.MethodDefinition | ESTree.PropertyDefinition;

const checkIsSameNode = (node: ESTree.Node, otherNode: ESTree.Node): boolean =>
  checkIsRangeContaining(node.range, otherNode.range) && checkIsRangeContaining(otherNode.range, node.range);

// Whether a statement declares a class or an enum, the only declarations whose reads are dependencies
const checkIsClassOrEnumItem = (item: SortingGroupItem): boolean => {
  const { node } = item;
  const declaration =
    (node.type === "ExportNamedDeclaration" || node.type === "ExportDefaultDeclaration") && node.declaration
      ? node.declaration
      : node;
  return declaration.type === "ClassDeclaration" || declaration.type === "TSEnumDeclaration";
};

// Whether a class element holds static state, whose reads run when the class is defined
const checkHoldsStaticState = (element: ESTree.ClassElement): boolean =>
  element.type === "StaticBlock" ||
  ((element.type === "PropertyDefinition" || element.type === "AccessorProperty") &&
    element.static &&
    !checkIsFunctionProperty(element));

// The ancestors of a node that pass the guard, up to the statement holding it.
// With `consecutiveOnly`, the run stops at the first ancestor that does not pass it.
const computeAncestors = <T extends ESTree.Node>(
  node: ESTree.Node,
  statement: ESTree.Node,
  checkWanted: (ancestor: ESTree.Node) => ancestor is T,
  consecutiveOnly: boolean,
): T[] => {
  const ancestors: T[] = [];
  let parent: ESTree.Node | null = node.parent;
  while (parent && !checkIsSameNode(parent, statement)) {
    if (checkWanted(parent)) ancestors.push(parent);
    else if (consecutiveOnly) break;
    parent = parent.parent;
  }
  return ancestors;
};

// Whether a read inside a class element runs at definition: a property's value does, unless it is a function.
// A method or function body runs later, except a read in its key, or in a static method of a class with static state.
const checkIsClassElementRelevant = (element: ClassElement, identifier: ESTree.Node): boolean => {
  if (element.type !== "MethodDefinition" && !checkIsFunctionProperty(element)) return true;
  if (checkIsRangeContaining(element.key.range, identifier.range)) return true;
  return (
    element.static &&
    element.parent.type === "ClassBody" &&
    element.parent.body.some((member) => checkHoldsStaticState(member))
  );
};

// Whether a read is left out of a class's or an enum's dependencies: a type reference, or a read a method runs later
const checkIsIgnoredReference = (statement: ESTree.Node, identifier: Reference["identifier"]): boolean => {
  const { parent } = identifier;
  if (parent.type === "TSTypeReference" && checkIsSameNode(parent.typeName, identifier)) return true;
  return !computeAncestors(
    identifier,
    statement,
    (ancestor): ancestor is ClassElement =>
      ancestor.type === "AccessorProperty" ||
      ancestor.type === "MethodDefinition" ||
      ancestor.type === "PropertyDefinition",
    false,
  ).every((element) => checkIsClassElementRelevant(element, identifier));
};

// The names a read reaches through member access, `value.name` reading `name`, and through qualified type names
const computeRelatedNames = (statement: ESTree.Node, identifier: Reference["identifier"]): string[] => [
  ...computeAncestors(
    identifier,
    statement,
    (ancestor): ancestor is ESTree.MemberExpression => ancestor.type === "MemberExpression",
    true,
  ).flatMap((member) => (member.property.type === "Identifier" ? [member.property.name] : [])),
  ...computeAncestors(
    identifier,
    statement,
    (ancestor): ancestor is ESTree.TSQualifiedName => ancestor.type === "TSQualifiedName",
    true,
  ).map((qualifiedName) => qualifiedName.right.name),
];

// Each item's dependencies are the names of the items it reads that sort ahead of it.
// A class or an enum reads another item by a reference resolving to it, or by a name it reaches through member access.
// Other declarations read nothing. The items are one partition's, so a dependency never crosses into another partition.
export const computeModuleDependencies = (context: Context, items: SortingGroupItem[]): SortingGroupItem[] => {
  if (!items.some((item) => checkIsClassOrEnumItem(item))) return items;
  const itemNames = new Set(items.map((item) => item.name));
  const namesByItem = collectReadNames(context, items, (referencingItem, reference, referencedItem) => {
    if (!checkIsClassOrEnumItem(referencingItem)) return [];
    const { identifier } = reference;
    return [
      ...(referencedItem !== undefined &&
      referencedItem !== referencingItem &&
      checkIsClassOrEnumItem(referencedItem) &&
      !checkIsIgnoredReference(referencingItem.node, identifier)
        ? [referencedItem.name]
        : []),
      ...computeRelatedNames(referencingItem.node, identifier).filter((name) => itemNames.has(name)),
    ];
  });
  return items.map((item) => ({ ...item, dependencies: namesByItem.get(item) ?? [] }));
};
