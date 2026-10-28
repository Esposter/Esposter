// A slot's children run across a row when the slot's element is a flex container laid out in a row, inline or block-level.
// Its computed style states that at any child count, where the children's own positions state it only with two or more
export const checkIsHorizontalFlow = (element: Element | null | undefined): boolean => {
  if (!element) return false;

  const style = getComputedStyle(element);
  return ["flex", "inline-flex"].includes(style.display) && style.flexDirection.startsWith("row");
};
