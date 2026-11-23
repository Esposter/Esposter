import type { ESTree } from "@oxlint/plugins";

// The expressions a pattern evaluates as it binds: the default of each binding and the computed key of each property, at
// Any depth. A plain identifier binding evaluates nothing
export const computePatternEvaluated = (pattern: ESTree.Node | null): ESTree.Node[] => {
  if (!pattern) return [];
  switch (pattern.type) {
    case "ArrayPattern":
      return pattern.elements.flatMap((element) => computePatternEvaluated(element));
    case "AssignmentPattern":
      return [pattern.right, ...computePatternEvaluated(pattern.left)];
    case "ObjectPattern":
      return pattern.properties.flatMap((property) =>
        property.type === "RestElement"
          ? computePatternEvaluated(property.argument)
          : [...(property.computed ? [property.key] : []), ...computePatternEvaluated(property.value)],
      );
    case "RestElement":
      return computePatternEvaluated(pattern.argument);
    default:
      return [];
  }
};
