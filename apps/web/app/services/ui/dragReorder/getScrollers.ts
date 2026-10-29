export const getScrollers = (container: HTMLElement) => {
  const scrollers: Element[] = [];
  for (
    let element: HTMLElement | null = container;
    element && element !== window.document.body && element !== window.document.documentElement;
    element = element.parentElement
  ) {
    const { overflowY } = getComputedStyle(element);
    if (overflowY === "auto" || overflowY === "overlay" || overflowY === "scroll") scrollers.push(element);
  }
  scrollers.push(window.document.scrollingElement ?? window.document.documentElement);
  return scrollers;
};
