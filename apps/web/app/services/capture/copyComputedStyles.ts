import { getCssText } from "@/services/capture/getCssText";

export const copyComputedStyles = (source: Element, target: Element) => {
  target.setAttribute("style", getCssText(window.getComputedStyle(source)));
  for (const [index, child] of [...source.children].entries()) {
    const clonedChild = target.children.item(index);
    if (clonedChild) copyComputedStyles(child, clonedChild);
  }
};
