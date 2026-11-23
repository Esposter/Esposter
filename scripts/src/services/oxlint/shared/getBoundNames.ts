import type { ESTree } from "@oxlint/plugins";

// The names a binding pattern introduces, a plain identifier or one destructured, defaulted or spread
export const getBoundNames = (pattern: ESTree.Node): string[] => {
  switch (pattern.type) {
    case "ArrayPattern":
      return pattern.elements.flatMap((element) => (element ? getBoundNames(element) : []));
    case "AssignmentPattern":
      return getBoundNames(pattern.left);
    case "Identifier":
      return [pattern.name];
    case "ObjectPattern":
      return pattern.properties.flatMap((property) =>
        getBoundNames(property.type === "RestElement" ? property : property.value),
      );
    case "RestElement":
      return getBoundNames(pattern.argument);
    default:
      return [];
  }
};
