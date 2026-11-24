import { getResultAsync, noop } from "@esposter/shared";
import { useEventListener } from "@vueuse/core";

// A click on the canvas takes the pointer, which the look reads while it is locked. The browser refuses a lock while
// The page is not focused, and within about a second of the player's Escape, and the player simply clicks again
export const useCanvasPointerLock = (canvas: EventTarget & Pick<HTMLCanvasElement, "requestPointerLock">): void => {
  useEventListener(canvas, "click", () => {
    // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so nothing waits on it
    getResultAsync(() => canvas.requestPointerLock()).match(noop, () => {
      // A refused lock is the expected answer to a click, not a failure to report, so nothing is logged for it
    });
  });
};
