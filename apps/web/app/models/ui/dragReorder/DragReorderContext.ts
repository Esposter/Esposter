import type { Press } from "@/models/ui/dragReorder/Press";

// The state one useDragReorder call holds across its presses, and the timers that drive it, which the drag's helpers
// Take in place of closing over them
export interface DragReorderContext {
  pauseAutoscroll: () => void;
  // The slides a drop left waiting for the next frame, once the new order has been rendered
  pendingSlides: Set<() => void>;
  // The press in progress, or nothing between presses
  press?: Press;
  resumeAutoscroll: () => void;
  resumeSlides: () => void;
  startTouchDelay: () => void;
  stopTouchDelay: () => void;
  // Swallows the click a release raises after a drag, until that click or the next press
  swallowing?: AbortController;
}
