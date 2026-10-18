import type { Element } from "genshin-world";

// Whether a season's opening characters hold exactly its three elements, each opener with one of them: a season whose
// Openers hold another element, or none, does not match
export const checkIsOpeningElementsMatched = (
  elements: Element[],
  openingElements: (Element | undefined)[],
): boolean => {
  const openingElementSet = new Set(openingElements);
  return elements.every((element) => openingElementSet.has(element)) && openingElementSet.size === elements.length;
};
