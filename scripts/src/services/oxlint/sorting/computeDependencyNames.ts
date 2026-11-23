import type { ESTree } from "@oxlint/plugins";

// The names a binding pattern binds, which the properties of an object pattern that read them depend on
export const computeDependencyNames = (pattern: ESTree.Node): string[] => {
  let current = pattern;
  while (current.type === "AssignmentPattern") current = current.left;
  switch (current.type) {
    case "ArrayPattern":
      return current.elements.flatMap((element) => {
        if (!element) return [];
        return computeDependencyNames(element.type === "RestElement" ? element.argument : element);
      });
    case "Identifier":
      return [current.name];
    case "ObjectPattern":
      return current.properties.flatMap((property) =>
        computeDependencyNames(property.type === "RestElement" ? property.argument : property.value),
      );
    default:
      return [];
  }
};
