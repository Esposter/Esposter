import type { DragReorderContext } from "@/models/ui/dragReorder/DragReorderContext";

import { REORDER_GHOST_CLASS } from "@/services/ui/constants";
import { endPress } from "@/services/ui/dragReorder/endPress";
import { stopSwallowing } from "@/services/ui/dragReorder/stopSwallowing";

// Takes a drag off the page with its component, leaving no row held, styled or swallowing a click
export const disposeDragReorder = (context: DragReorderContext) => {
  stopSwallowing(context);
  const { press } = context;
  if (!press) return;
  for (const item of press.items) {
    item.classList.remove(REORDER_GHOST_CLASS);
    item.style.transition = "";
    item.style.translate = "";
  }
  endPress(context, press);
};
