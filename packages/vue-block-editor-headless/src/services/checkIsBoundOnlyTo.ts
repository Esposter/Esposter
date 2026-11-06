import type { ArrowElement } from "#src/models/ArrowElement";

// Whether an arrow is bound at one end or both, and every end it binds names the given element
export const checkIsBoundOnlyTo = (arrow: ArrowElement, elementId: string): boolean => {
  const bindings = [arrow.start.binding, arrow.end.binding];
  return (
    bindings.some((binding) => binding?.elementId === elementId) &&
    bindings.every((binding) => binding === undefined || binding.elementId === elementId)
  );
};
