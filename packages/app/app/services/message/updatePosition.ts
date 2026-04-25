import type { VirtualElement } from "@floating-ui/dom";
import type { Editor } from "@tiptap/core";

import { computePosition, flip, shift } from "@floating-ui/dom";
import { posToDOMRect } from "@tiptap/vue-3";

export const updatePosition = async (editor: Editor, element: HTMLElement) => {
  const virtualElement: VirtualElement = {
    getBoundingClientRect: () => posToDOMRect(editor.view, editor.state.selection.from, editor.state.selection.to),
  };
  const { strategy, x, y } = await computePosition(virtualElement, element, {
    middleware: [shift(), flip()],
    placement: "top-start",
    strategy: "absolute",
  });
  element.style.left = `${x}px`;
  element.style.position = strategy;
  element.style.top = `${y}px`;
  element.style.width = "max-content";
  element.style.zIndex = "9999";
};
