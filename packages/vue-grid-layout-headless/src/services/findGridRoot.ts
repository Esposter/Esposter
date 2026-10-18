import { mountedGrids } from "#src/services/mountedGrids";

// The root of the nearest registered grid at or above an element, so an inner grid's root is found before an outer one's
export const findGridRoot = (element: Element | null): Element | undefined => {
  let current = element;
  while (current && !mountedGrids.has(current)) current = current.parentElement;
  return current ?? undefined;
};
