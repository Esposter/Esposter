// @vitest-environment happy-dom
import type { PDFViewer as PdfJsViewer } from "pdfjs-dist/web/pdf_viewer.mjs";

import { usePdfZoomGesture } from "#src/composables/usePdfZoomGesture";
import { PDF_MAX_SCALE, PDF_WHEEL_ZOOM_DIVISOR } from "#src/services/constants";
import { describe, expect, test } from "vitest";
import { effectScope, nextTick, shallowRef } from "vue";

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
    const wheel = Object.assign(new Event("wheel", { cancelable: true }), {
      clientX: 0,
      clientY: 0,
      ctrlKey: true,
      deltaY: -PDF_WHEEL_ZOOM_DIVISOR,
    });
    container.dispatchEvent(wheel);

    expect(viewer.currentScale).toBeCloseTo(Math.E);
    expect(wheel.defaultPrevented).toBe(true);
    scope.stop();
  });

  test("zooming with Ctrl and the wheel stops at the largest scale", () => {
    expect.hasAssertions();

    const viewer = createViewer(PDF_MAX_SCALE / 2);
    const { container, scope } = mountGesture(viewer);
    container.dispatchEvent(
      Object.assign(new Event("wheel", { cancelable: true }), {
        clientX: 0,
        clientY: 0,
        ctrlKey: true,
        deltaY: -PDF_WHEEL_ZOOM_DIVISOR * 2,
      }),
    );

    expect(viewer.currentScale).toBe(PDF_MAX_SCALE);
    scope.stop();
  });

  test("lifting one of two pointers ends the pinch", () => {
    expect.hasAssertions();

    const viewer = createViewer(1);
    const { container, scope } = mountGesture(viewer);
    dispatchPointer(container, "pointerdown", 1, 100, 100);
    dispatchPointer(container, "pointerdown", 2, 200, 100);
    dispatchPointer(container, "pointerup", 2, 200, 100);
    dispatchPointer(container, "pointermove", 1, 300, 100);

    expect(viewer.currentScale).toBe(1);
    scope.stop();
  });

  test("a container set after setup gets the gestures", async () => {
    expect.hasAssertions();

    const viewer = createViewer(1);
    const container = shallowRef<HTMLDivElement | undefined>();
    const scope = effectScope();
    scope.run(() => usePdfZoomGesture({ container, getViewer: () => viewer }));
    const element = window.document.createElement("div");
    container.value = element;
    await nextTick();
    element.dispatchEvent(
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
