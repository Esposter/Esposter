import type { ESTree } from "@oxlint/plugins";

// The names a binding pattern binds, which a property of an object pattern is known by to the properties that read it
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
