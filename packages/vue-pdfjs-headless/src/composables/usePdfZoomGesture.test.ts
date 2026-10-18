// @vitest-environment happy-dom
import type { PDFViewer as PdfJsViewer } from "pdfjs-dist/web/pdf_viewer.mjs";

import { usePdfZoomGesture } from "#src/composables/usePdfZoomGesture";
import { PDF_WHEEL_ZOOM_DIVISOR } from "#src/services/constants";
import { describe, expect, test } from "vitest";
import { effectScope } from "vue";

const dispatchPointer = (target: HTMLElement, type: string, pointerId: number, clientX: number, clientY: number) => {
  target.dispatchEvent(Object.assign(new Event(type), { clientX, clientY, pointerId }));
};
// The viewer keeps only the scale the gestures read and write, so a plain object stands in for it
const createViewer = (currentScale: number) => ({ currentScale }) as unknown as PdfJsViewer;
const mountGesture = (viewer: PdfJsViewer) => {
  const container = window.document.createElement("div");
  const scope = effectScope();
  scope.run(() => usePdfZoomGesture({ container, getViewer: () => viewer }));

  return { container, scope };
};

describe(usePdfZoomGesture, () => {
  test("#223 pinching to zoom", () => {
    expect.hasAssertions();

    const viewer = createViewer(1);
    const { container, scope } = mountGesture(viewer);
    dispatchPointer(container, "pointerdown", 1, 100, 100);
    dispatchPointer(container, "pointerdown", 2, 200, 100);
    dispatchPointer(container, "pointermove", 2, 300, 100);

    expect(viewer.currentScale).toBe(2);
    // The point between the pointers is 200 across, so the content under it stays there at the doubled scale
    expect(container.scrollLeft).toBe(200);
    scope.stop();
  });

  test("zooming with Ctrl and the wheel", () => {
    expect.hasAssertions();

    const viewer = createViewer(1);
    const { container, scope } = mountGesture(viewer);
    container.dispatchEvent(
      Object.assign(new Event("wheel", { cancelable: true }), {
        clientX: 0,
        clientY: 0,
        ctrlKey: true,
        deltaY: -PDF_WHEEL_ZOOM_DIVISOR,
      }),
    );

    expect(viewer.currentScale).toBeCloseTo(Math.E);
    scope.stop();
  });

  test("the wheel without Ctrl leaves the scale to the page", () => {
    expect.hasAssertions();

    const viewer = createViewer(1);
    const { container, scope } = mountGesture(viewer);
    container.dispatchEvent(new Event("wheel", { cancelable: true }));

    expect(viewer.currentScale).toBe(1);
    scope.stop();
  });

  test("the gestures stop once the scope is disposed", () => {
    expect.hasAssertions();

    const viewer = createViewer(1);
    const { container, scope } = mountGesture(viewer);
    scope.stop();
    container.dispatchEvent(
      Object.assign(new Event("wheel", { cancelable: true }), {
        clientX: 0,
        clientY: 0,
        ctrlKey: true,
        deltaY: -PDF_WHEEL_ZOOM_DIVISOR,
      }),
    );

    expect(viewer.currentScale).toBe(1);
  });
});
