import type { DragReorderContext } from "@/models/ui/dragReorder/DragReorderContext";

// Lets go of the click a release swallowed, or of the one still waiting to be swallowed
export const stopSwallowing = (context: DragReorderContext) => {
  context.swallowing?.abort();
  context.swallowing = undefined;
};
