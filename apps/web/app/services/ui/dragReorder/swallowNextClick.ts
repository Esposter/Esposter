import type { DragReorderContext } from "@/models/ui/dragReorder/DragReorderContext";

import { stopSwallowing } from "@/services/ui/dragReorder/stopSwallowing";
import { swallowClick } from "@/services/ui/swallowClick";

// The click a release raises after a drag, and only that one: a press or a key starts something whose click is its
// Own, since a touch drag raises none at all
export const swallowNextClick = (context: DragReorderContext) => {
  stopSwallowing(context);
  const controller = new AbortController();
  context.swallowing = controller;
  const options = { capture: true, signal: controller.signal };
  window.addEventListener(
    "click",
    (event) => {
      swallowClick(event);
      stopSwallowing(context);
    },
    options,
  );
  window.addEventListener(
    "keydown",
    () => {
      stopSwallowing(context);
    },
    options,
  );
  window.addEventListener(
    "pointerdown",
    () => {
      stopSwallowing(context);
    },
    options,
  );
};
