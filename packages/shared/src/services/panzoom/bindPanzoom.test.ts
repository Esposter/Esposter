// @vitest-environment happy-dom
import { PANZOOM_DEFAULT_EXCLUDE_CLASS } from "#src/services/panzoom/constants";
import { createPanzoom } from "#src/services/panzoom/createPanzoom";
import { setupPanzoomDom } from "#src/services/panzoom/setupPanzoomDom.test";
import { stubPanzoomLayout } from "#src/services/panzoom/stubPanzoomLayout.test";
import { stubPanzoomParent } from "#src/services/panzoom/stubPanzoomParent.test";
import { PanzoomEventName } from "#src/models/panzoom/PanzoomEventName";
import { bindPanzoom } from "#src/services/panzoom/bindPanzoom";
import { describe, expect, test, vi } from "vitest";

// A pointer event as a browser sends it: pointers are told apart by id, and move and up reach the document
const dispatchPointer = (
  target: EventTarget,
  type: string,
  pointerId: number,
  point: { x: number; y: number },
  button = 0,
): void => {
  target.dispatchEvent(
    new PointerEvent(type, { bubbles: true, button, clientX: point.x, clientY: point.y, pointerId }),
  );
};

describe(bindPanzoom, () => {
  const { getElement, getParent } = setupPanzoomDom();

  test("#474 sends panzoomend once, after the last of two pointers lifts from a pinch", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 200, left: 0, top: 0, width: 200 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    createPanzoom(element);
    const listener = vi.fn<(event: Event) => void>();
    element.addEventListener(PanzoomEventName.End, listener);
    dispatchPointer(element, "pointerdown", 1, { x: 50, y: 50 });
    dispatchPointer(element, "pointerdown", 2, { x: 150, y: 50 });

    dispatchPointer(document, "pointerup", 1, { x: 50, y: 50 });
    const endsAfterFirstLift = listener.mock.calls.length;
    dispatchPointer(document, "pointerup", 2, { x: 150, y: 50 });

    expect(endsAfterFirstLift).toBe(0);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("#651 and #652 a drag carries on from its pointer after a zoom, so the element does not jump back", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 400, left: 0, top: 0, width: 400 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element);
    dispatchPointer(element, "pointerdown", 1, { x: 100, y: 100 });
    panzoom.zoomToPoint(2, { clientX: 100, clientY: 100 });

    dispatchPointer(document, "pointermove", 1, { x: 110, y: 100 });

    expect(panzoom.getPan()).toStrictEqual({ x: 55, y: 50 });
  });

  test("#654 a pinch with pinchAndPan keeps the content under the midpoint of the fingers", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 200, left: 0, top: 0, width: 200 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element, { pinchAndPan: true });
    dispatchPointer(element, "pointerdown", 1, { x: 100, y: 90 });
    dispatchPointer(element, "pointerdown", 2, { x: 100, y: 110 });

    dispatchPointer(document, "pointermove", 1, { x: 100, y: 85 });
    dispatchPointer(document, "pointermove", 2, { x: 100, y: 125 });

    expect(panzoom.getScale()).toBe(2);
    expect(panzoom.getPan()).toStrictEqual({ x: 0, y: 2.5 });
  });

  test("#63 #643 and #671 a pinch scales by the ratio of the finger distance, not by its increment", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 200 });
    stubPanzoomParent(getParent(), { height: 100, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element, { maxScale: 8, startScale: 4 });
    dispatchPointer(element, "pointerdown", 1, { x: 50, y: 50 });
    dispatchPointer(element, "pointerdown", 2, { x: 150, y: 50 });

    dispatchPointer(document, "pointermove", 2, { x: 250, y: 50 });

    expect(panzoom.getScale()).toBe(8);
  });

  test("#683 a pinch whose fingers double apart doubles the scale at any zoom", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 200 });
    stubPanzoomParent(getParent(), { height: 100, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element, { maxScale: 40, startScale: 20 });
    dispatchPointer(element, "pointerdown", 1, { x: 50, y: 50 });
    dispatchPointer(element, "pointerdown", 2, { x: 150, y: 50 });

    dispatchPointer(document, "pointermove", 2, { x: 250, y: 50 });

    expect(panzoom.getScale()).toBe(40);
  });

  test("#546 writes the pan cursor while a drag is live, and the cursor again once it ends", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    createPanzoom(element, { cursor: "grab", panCursor: "grabbing" });
    dispatchPointer(element, "pointerdown", 1, { x: 10, y: 10 });
    const cursorDuringDrag = element.style.cursor;

    dispatchPointer(document, "pointerup", 1, { x: 10, y: 10 });

    expect(cursorDuringDrag).toBe("grabbing");
    expect(element.style.cursor).toBe("grab");
  });

  test("#129 a filter passes only a pointer down on the middle button to a pan", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element, { filter: (event) => event.button === 1 });
    dispatchPointer(element, "pointerdown", 1, { x: 0, y: 0 }, 0);
    dispatchPointer(document, "pointermove", 1, { x: 10, y: 20 });
    const panWithLeftButton = panzoom.getPan();

    dispatchPointer(element, "pointerdown", 2, { x: 0, y: 0 }, 1);
    dispatchPointer(document, "pointermove", 2, { x: 10, y: 20 });

    expect(panWithLeftButton).toStrictEqual({ x: 0, y: 0 });
    expect(panzoom.getPan()).toStrictEqual({ x: 10, y: 20 });
  });

  test("#197 a filter for the right button pans with that button only", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element, { filter: (event) => event.button === 2 });
    dispatchPointer(element, "pointerdown", 1, { x: 0, y: 0 }, 0);
    dispatchPointer(document, "pointermove", 1, { x: 10, y: 20 });
    const panWithLeftButton = panzoom.getPan();

    dispatchPointer(element, "pointerdown", 2, { x: 0, y: 0 }, 2);
    dispatchPointer(document, "pointermove", 2, { x: 10, y: 20 });

    expect(panWithLeftButton).toStrictEqual({ x: 0, y: 0 });
    expect(panzoom.getPan()).toStrictEqual({ x: 10, y: 20 });
  });

  test("#527 #609 a filter that vetoes a button starts no gesture at all", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element, { filter: (event) => event.button !== 2 });
    const listener = vi.fn<(event: Event) => void>();
    element.addEventListener(PanzoomEventName.Start, listener);

    dispatchPointer(element, "pointerdown", 1, { x: 0, y: 0 }, 2);
    dispatchPointer(document, "pointermove", 1, { x: 50, y: 0 });

    expect(panzoom.getPan()).toStrictEqual({ x: 0, y: 0 });
    expect(listener).not.toHaveBeenCalled();
  });

  test("#441 and #452 a drag starts once the pointer travels past the threshold, and pans from where it went down", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element, { panThreshold: 5 });
    dispatchPointer(element, "pointerdown", 1, { x: 0, y: 0 });
    dispatchPointer(document, "pointermove", 1, { x: 3, y: 0 });
    const panWithinThreshold = panzoom.getPan();

    dispatchPointer(document, "pointermove", 1, { x: 6, y: 0 });

    expect(panWithinThreshold).toStrictEqual({ x: 0, y: 0 });
    expect(panzoom.getPan()).toStrictEqual({ x: 6, y: 0 });
  });

  test("#674 swallows the click that follows a drag past the threshold", () => {
    expect.hasAssertions();

    const element = getElement();
    const child = document.createElement("span");
    element.append(child);
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    createPanzoom(element);
    const childClick = vi.fn<(event: Event) => void>();
    child.addEventListener("click", childClick);
    dispatchPointer(element, "pointerdown", 1, { x: 0, y: 0 });
    dispatchPointer(document, "pointermove", 1, { x: 30, y: 0 });
    dispatchPointer(document, "pointerup", 1, { x: 30, y: 0 });

    child.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(childClick).not.toHaveBeenCalled();
  });

  test("#674 lets the click through after a press that did not drag", () => {
    expect.hasAssertions();

    const element = getElement();
    const child = document.createElement("span");
    element.append(child);
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    createPanzoom(element);
    const childClick = vi.fn<(event: Event) => void>();
    child.addEventListener("click", childClick);
    dispatchPointer(element, "pointerdown", 1, { x: 0, y: 0 });
    dispatchPointer(document, "pointerup", 1, { x: 0, y: 0 });

    child.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(childClick).toHaveBeenCalledTimes(1);
  });

  test("an element with the exclude class starts no gesture", () => {
    expect.hasAssertions();

    const element = getElement();
    const child = document.createElement("span");
    child.classList.add(PANZOOM_DEFAULT_EXCLUDE_CLASS);
    element.append(child);
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element);
    dispatchPointer(child, "pointerdown", 1, { x: 0, y: 0 });
    dispatchPointer(document, "pointermove", 1, { x: 50, y: 0 });

    expect(panzoom.getPan()).toStrictEqual({ x: 0, y: 0 });
  });

  test("destroy aborts the listeners, so a pointer down after it pans nothing", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element);

    panzoom.destroy();
    dispatchPointer(element, "pointerdown", 1, { x: 0, y: 0 });
    dispatchPointer(document, "pointermove", 1, { x: 50, y: 0 });

    expect(panzoom.getPan()).toStrictEqual({ x: 0, y: 0 });
  });

  test("a bind after destroy binds nothing, so a pointer down after it pans nothing", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element);
    panzoom.destroy();

    panzoom.bind();
    dispatchPointer(element, "pointerdown", 1, { x: 0, y: 0 });
    dispatchPointer(document, "pointermove", 1, { x: 50, y: 0 });

    expect(panzoom.getPan()).toStrictEqual({ x: 0, y: 0 });
  });

  test("a panzoomend listener that destroys leaves the elements with the styles they had before", () => {
    expect.hasAssertions();

    const element = getElement();
    const parent = getParent();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(parent, { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element);
    element.addEventListener(PanzoomEventName.End, () => {
      panzoom.destroy();
    });
    dispatchPointer(element, "pointerdown", 1, { x: 0, y: 0 });

    dispatchPointer(document, "pointerup", 1, { x: 0, y: 0 });

    expect(parent.style.getPropertyValue("overflow")).toBe("");
    expect(parent.style.getPropertyValue("touch-action")).toBe("");
    expect(element.style.getPropertyValue("touch-action")).toBe("");
    expect(element.style.getPropertyValue("cursor")).toBe("");
  });

  test("a panzoomzoom listener that destroys during a pinch writes no transform after it", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 200, left: 0, top: 0, width: 200 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element, { pinchAndPan: true });
    element.addEventListener(PanzoomEventName.Zoom, () => {
      panzoom.destroy();
    });
    dispatchPointer(element, "pointerdown", 1, { x: 100, y: 90 });
    dispatchPointer(element, "pointerdown", 2, { x: 100, y: 110 });

    dispatchPointer(document, "pointermove", 1, { x: 100, y: 85 });

    expect(element.style.getPropertyValue("transform")).toBe("");
  });
});
