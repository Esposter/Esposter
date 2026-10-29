import type { DragReorderContext } from "@/models/ui/dragReorder/DragReorderContext";

// A call site renders the new order on its own schedule, an optimistic store a few microtasks on, so the rows keep
// Where they were let go until the next frame, which is painted only after that render has landed, and slide from there
export const flushPendingSlides = (context: DragReorderContext) => {
  for (const pendingSlide of context.pendingSlides) pendingSlide();
  context.pendingSlides.clear();
};
