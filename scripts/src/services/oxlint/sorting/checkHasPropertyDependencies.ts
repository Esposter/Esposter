import type { ESTree } from "@oxlint/plugins";

// Whether a pattern holds a default value or a computed key, the two ways one of its bindings can read another
export const checkHasPropertyDependencies = (node: ESTree.Node): boolean => {
  const pattern = node.type === "RestElement" ? node.argument : node;
  switch (pattern.type) {
    case "ArrayPattern":
      return pattern.elements.some((element) => (element ? checkHasPropertyDependencies(element) : false));
    case "Identifier":
      return false;
    case "ObjectPattern":
      return pattern.properties.some((property) =>
        property.type === "RestElement"
          ? checkHasPropertyDependencies(property)
          : property.computed || checkHasPropertyDependencies(property.value),
      );
    default:
      return true;
  }
};
