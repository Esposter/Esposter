import type { PDFViewer as PdfJsViewer } from "pdfjs-dist/web/pdf_viewer.mjs";
import type { MaybeRefOrGetter } from "vue";

import { PDF_MAX_SCALE, PDF_MIN_SCALE, PDF_WHEEL_ZOOM_DIVISOR } from "#src/services/constants";
import { getZoomedScroll } from "#src/services/getZoomedScroll";
import { onScopeDispose, toValue, watch } from "vue";

interface PinchPoint {
  x: number;
  y: number;
}

interface UsePdfZoomGestureOptions {
  container: MaybeRefOrGetter<HTMLDivElement | undefined>;
  // Reads the viewer the gestures scale, which is built once the document's viewer is ready
  getViewer: () => PdfJsViewer | undefined;
}

// Pinch and Ctrl with the wheel scale the viewer about the pointer, keeping the content under it where it was.
// The listeners sit on the container under one abort signal of their own, so the scope's end releases them all
export const usePdfZoomGesture = ({ container, getViewer }: UsePdfZoomGestureOptions): void => {
  const abortController = new AbortController();
  const pointers = new Map<number, PinchPoint>();
  let pinchDistance = 0;

  const measurePinch = () => {
    const [first, second] = [...pointers.values()];
    if (pointers.size !== 2 || !first || !second) return undefined;

    return {
      distance: Math.hypot(second.x - first.x, second.y - first.y),
      point: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 },
    };
  };
  // Scales the viewer about a point of the screen, keeping the content under that point where it was
  const zoomAbout = (ratio: number, point: PinchPoint) => {
    const viewer = getViewer();
    const element = toValue(container);
    if (!viewer || !element) return;

    const { currentScale } = viewer;
    const nextScale = Math.min(Math.max(currentScale * ratio, PDF_MIN_SCALE), PDF_MAX_SCALE);
    const scaleRatio = nextScale / currentScale;
    const { left, top } = element.getBoundingClientRect();
    const { scrollLeft, scrollTop } = element;
    viewer.currentScale = nextScale;
    element.scrollLeft = getZoomedScroll({ point: point.x - left, ratio: scaleRatio, scroll: scrollLeft });
    element.scrollTop = getZoomedScroll({ point: point.y - top, ratio: scaleRatio, scroll: scrollTop });
  };
  const onPointerDown = (event: PointerEvent) => {
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    pinchDistance = measurePinch()?.distance ?? 0;
  };
  const onPointerMove = (event: PointerEvent) => {
    if (!pointers.has(event.pointerId)) return;

    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const pinch = measurePinch();
    if (pinch && pinchDistance > 0) zoomAbout(pinch.distance / pinchDistance, pinch.point);
    pinchDistance = pinch?.distance ?? 0;
  };
  const onPointerEnd = (event: PointerEvent) => {
    pointers.delete(event.pointerId);
    pinchDistance = measurePinch()?.distance ?? 0;
  };
  const onWheel = (event: WheelEvent) => {
    if (!event.ctrlKey) return;

    event.preventDefault();
    zoomAbout(Math.exp(-event.deltaY / PDF_WHEEL_ZOOM_DIVISOR), { x: event.clientX, y: event.clientY });
  };

  // The consumer's container is set once for a viewer, so the listeners are added when it first reads as present
  watch(
    () => toValue(container),
    (element) => {
      if (!element) return;

      const { signal } = abortController;
      element.addEventListener("pointerdown", onPointerDown, { signal });
      element.addEventListener("pointermove", onPointerMove, { signal });
      element.addEventListener("pointerup", onPointerEnd, { signal });
      element.addEventListener("pointercancel", onPointerEnd, { signal });
      element.addEventListener("pointerleave", onPointerEnd, { signal });
      element.addEventListener("wheel", onWheel, { passive: false, signal });
    },
    { immediate: true },
  );
  onScopeDispose(() => {
    abortController.abort();
  });
};
