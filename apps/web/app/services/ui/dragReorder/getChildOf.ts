export const getChildOf = (container: HTMLElement, target: Element) => {
  let element: Element | null = target;
  while (element && element.parentElement !== container) element = element.parentElement;
  return element;
};
