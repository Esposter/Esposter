import type { ESTree } from "@oxlint/plugins";

// The names a `vi.useFakeTimers` call lists under `toFake`, or `undefined` when it lists none and so fakes Vitest's
// Default set, `setTimeout` and `setImmediate` among them. An element that is not a string literal reads as `""`,
// A name no check accepts
export const getFakedTimerNames = (
  options: ESTree.Expression | ESTree.SpreadElement | undefined,
): string[] | undefined => {
  if (options?.type !== "ObjectExpression") return undefined;
  const toFake = options.properties.find(
    (property): property is ESTree.ObjectProperty =>
      property.type === "Property" && property.key.type === "Identifier" && property.key.name === "toFake",
  );
  if (toFake?.value.type !== "ArrayExpression") return undefined;
  return toFake.value.elements.map((element) =>
    element?.type === "Literal" && typeof element.value === "string" ? element.value : "",
  );
};
