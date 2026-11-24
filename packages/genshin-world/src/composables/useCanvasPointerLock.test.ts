import { useCanvasPointerLock } from "#src/composables/useCanvasPointerLock";
import { describe, expect, test, vi } from "vitest";

// A turn of the event loop, by which the exception a listener's returned rejection raises has been raised
const waitForTurn = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

describe(useCanvasPointerLock, () => {
  test("a refused pointer lock is answered on the click and never escapes the handler", async () => {
    expect.hasAssertions();

    // Node raises a rejection an event listener returns as an uncaught exception, where a browser reports it as an
    // Unhandled rejection
    const onUncaughtException = vi.fn<(error: Error) => void>();
    process.on("uncaughtException", onUncaughtException);
    // A plain function rather than a spy, since the spy's own handling of a returned rejection would hide it
    let lockRequests = 0;
    const canvas = Object.assign(new EventTarget(), {
      requestPointerLock: () => {
        lockRequests += 1;
        return Promise.reject(new Error(" "));
      },
    });
    useCanvasPointerLock(canvas);
    canvas.dispatchEvent(new Event("click"));
    await waitForTurn();
    process.off("uncaughtException", onUncaughtException);

    expect(lockRequests).toBe(1);
    expect(onUncaughtException).not.toHaveBeenCalled();
  });
});
