import type { DragReorderContext } from "@/models/ui/dragReorder/DragReorderContext";

import { stopSwallowing } from "@/services/ui/dragReorder/stopSwallowing";
import { swallowNextWindowClick } from "@/services/ui/swallowNextWindowClick";

// The click a release raises after a drag, and only that one: a press or a key starts something whose click is its
// Own, since a touch drag raises none at all
export const swallowNextClick = (context: DragReorderContext) => {
  stopSwallowing(context);
  context.stopSwallow = swallowNextWindowClick();
};
