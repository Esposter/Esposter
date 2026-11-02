// @vitest-environment happy-dom
import { PanzoomContain } from "#src/models/panzoom/PanzoomContain";
import { PanzoomEventName } from "#src/models/panzoom/PanzoomEventName";
import { createPanzoom } from "#src/services/panzoom/createPanzoom";
import { setupPanzoomDom } from "#src/services/panzoom/setupPanzoomDom.test";
import { stubPanzoomLayout } from "#src/services/panzoom/stubPanzoomLayout.test";
import { stubPanzoomParent } from "#src/services/panzoom/stubPanzoomParent.test";
import { describe, expect, test, vi } from "vitest";

// Happy-dom's WheelEvent drops clientX and clientY from its init, so the point is defined on the event as a browser sets it
const wheelAt = (point: { x: number; y: number }, deltaY: number): WheelEvent => {
  const event = new WheelEvent("wheel", { deltaY });
  Object.defineProperties(event, { clientX: { value: point.x }, clientY: { value: point.y } });

  return event;
};

describe(createPanzoom, () => {
  const { getElement, getParent } = setupPanzoomDom();

  test("#666 keeps a pan made right after construction", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element);

    panzoom.pan(50, 50);

    expect(panzoom.getPan()).toStrictEqual({ x: 50, y: 50 });
  });

  test("#697 sends no event at construction", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const listener = vi.fn<(event: Event) => void>();
    for (const name of [
      PanzoomEventName.Change,
      PanzoomEventName.Pan,
      PanzoomEventName.Reset,
      PanzoomEventName.Start,
      PanzoomEventName.Zoom,
    ])
      element.addEventListener(name, listener);

    createPanzoom(element, { startScale: 2, startX: 10 });

    expect(listener).not.toHaveBeenCalled();
  });

  test("#670 holds the start pan at the start scale, contained at that scale, and reset lands on the same", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 200, left: 0, top: 0, width: 200 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element, { contain: PanzoomContain.Outside, startScale: 1.2 });
    const started = panzoom.getPan();

    panzoom.reset({ animate: false });

    expect(panzoom.getScale()).toBe(1.2);
    expect(started).toStrictEqual({ x: 0, y: 0 });
    expect(panzoom.getPan()).toStrictEqual(started);
  });

  test("#616 and #656 start at the fit scale when startScale is fit", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 200, left: 0, top: 0, width: 400 });
    stubPanzoomParent(getParent(), { height: 100, left: 0, top: 0, width: 200 });

    expect(createPanzoom(element, { startScale: "fit" }).getScale()).toBe(0.5);
  });

  test("#432 fit scales the element to its parent and centres it on the parent's content box", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 300 });
    const panzoom = createPanzoom(element);

    panzoom.fit();
    const rectangle = element.getBoundingClientRect();

    expect(panzoom.getScale()).toBe(2);
    expect(panzoom.getPan()).toStrictEqual({ x: 50, y: 25 });
    expect({ x: rectangle.left + rectangle.width / 2, y: rectangle.top + rectangle.height / 2 }).toStrictEqual({
      x: 150,
      y: 100,
    });
  });

  test("#646 a direct child of a shadow root is measured against its host", () => {
    expect.hasAssertions();

    const host = document.createElement("div");
    document.body.append(host);
    const shadowChild = document.createElement("div");
    host.attachShadow({ mode: "open" }).append(shadowChild);
    stubPanzoomLayout(shadowChild, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(host, { height: 200, left: 0, top: 0, width: 200 });

    const panzoom = createPanzoom(shadowChild);

    expect(panzoom.getPan()).toStrictEqual({ x: 0, y: 0 });
    expect(host.style.overflow).toBe("hidden");
  });

  test("#693 accepts an element attached to another document", () => {
    expect.hasAssertions();

    const otherDocument = document.implementation.createHTMLDocument("");
    const otherElement = otherDocument.createElement("div");
    otherDocument.body.append(otherElement);
    stubPanzoomLayout(otherElement, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(otherDocument.body, { height: 200, left: 0, top: 0, width: 200 });

    expect(createPanzoom(otherElement).getPan()).toStrictEqual({ x: 0, y: 0 });
  });

  test("#48 leaves the cursor to the stylesheet while panning is disabled, and writes it again once it is enabled", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element, { disablePan: true });
    const cursorWhileDisabled = element.style.cursor;

    panzoom.setOptions({ disablePan: false });

    expect(cursorWhileDisabled).toBe("");
    expect(element.style.cursor).toBe("move");
  });

  test("the transform, its origin, and the overflow and touch action of both elements are written at construction", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    createPanzoom(element);

    expect(element.style.getPropertyValue("transform")).toBe("scale(1) translate(0px, 0px)");
    expect(element.style.getPropertyValue("transform-origin")).toBe("50% 50%");
    expect(element.style.getPropertyValue("touch-action")).toBe("none");
    expect(getParent().style.getPropertyValue("overflow")).toBe("hidden");
    expect(getParent().style.getPropertyValue("touch-action")).toBe("none");
  });

  test("the transform origin is the element's centre, whatever origin the element was styled with", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    element.style.setProperty("transform-origin", "0 0");
    createPanzoom(element);

    expect(element.style.getPropertyValue("transform-origin")).toBe("50% 50%");
  });

  test("#627 writes the scale to the --panzoom-scale custom property", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element);

    panzoom.zoom(2);

    expect(element.style.getPropertyValue("--panzoom-scale")).toBe("2");
  });

  test("#102 automatic containment holds a fitting element inside its parent and an overflowing one outside it", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 100, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element, { contain: PanzoomContain.Automatic });

    const inside = panzoom.pan(500, 0);
    panzoom.zoom(3);
    const outside = panzoom.pan(500, 0);

    expect(inside.x).toBe(100);
    expect(outside.x).toBeCloseTo(100 / 3, 6);
  });

  test("#583 and #511 automatic containment holds each axis by its own size", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 50, left: 0, top: 0, width: 400 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element, { contain: PanzoomContain.Automatic });

    panzoom.pan(-1000, -1000);

    expect(panzoom.getPan()).toStrictEqual({ x: -200, y: 0 });
  });

  test("#598 holds an element that fits inside its parent on an axis under automatic containment", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 100, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element, { contain: PanzoomContain.Automatic });

    panzoom.pan(500, 500);

    expect(panzoom.getPan()).toStrictEqual({ x: 100, y: 0 });
  });

  test("#707 covers its parent with an element that overflows it under automatic containment", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 400, left: 0, top: 0, width: 400 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element, { contain: PanzoomContain.Automatic });

    panzoom.pan(-1000, -1000);

    expect(panzoom.getPan()).toStrictEqual({ x: -200, y: -200 });
  });

  test("#504 zooms out to the fit and no further under automatic containment", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 200, left: 0, top: 0, width: 400 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element, { contain: PanzoomContain.Automatic });

    panzoom.zoom(0.1);

    expect(panzoom.getScale()).toBe(0.5);
  });

  test("#586 a wheel step follows its delta, a full notch being one step and a smaller delta a part of one", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 200 });
    stubPanzoomParent(getParent(), { height: 100, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element);

    panzoom.zoomWithWheel(new WheelEvent("wheel", { deltaY: -100 }));
    panzoom.zoomWithWheel(new WheelEvent("wheel", { deltaY: -25 }));

    expect(panzoom.getScale()).toBeCloseTo(Math.exp(0.125), 9);
  });

  test("#623 zooms about the point at the size the previous write rendered, not the one before it", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 1000, left: 0, top: 0, width: 1000 });
    stubPanzoomParent(getParent(), { height: 500, left: 0, top: 0, width: 500 });
    const panzoom = createPanzoom(element);

    panzoom.zoomToPoint(1.1, { clientX: 250, clientY: 250 });
    panzoom.zoomToPoint(1.21, { clientX: 250, clientY: 250 });

    expect(panzoom.getPan().x).toBeCloseTo(43.39, 2);
  });

  test("#657 zooms a wheel about the point at the size the previous wheel rendered", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 1000, left: 0, top: 0, width: 1000 });
    stubPanzoomParent(getParent(), { height: 500, left: 0, top: 0, width: 500 });
    const panzoom = createPanzoom(element);

    panzoom.zoomWithWheel(wheelAt({ x: 250, y: 250 }, -100));
    panzoom.zoomWithWheel(wheelAt({ x: 250, y: 250 }, -100));

    expect(panzoom.getPan().x).toBeCloseTo(45.3173, 4);
  });

  test("a wheel zoom that disableZoom refuses is not default-prevented, so an ancestor can still scroll", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element, { disableZoom: true });
    const event = new WheelEvent("wheel", { cancelable: true, deltaY: -100 });

    panzoom.zoomWithWheel(event);

    expect(event.defaultPrevented).toBe(false);
  });

  test("#639 and #692 a per-call animate writes its transition", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element);

    panzoom.zoomToPoint(2, { clientX: 0, clientY: 0 }, { animate: true });

    expect(element.style.getPropertyValue("transition")).toBe("transform 200ms ease-in-out");
  });

  test("#708 and #709 reset clamps the start pan at the scale it applies, in one write", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 400, left: 0, top: 0, width: 400 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element, { contain: PanzoomContain.Outside, startX: -1000 });

    panzoom.zoom(2);
    const reset = panzoom.reset({ animate: false });

    expect(reset.scale).toBe(1);
    expect(panzoom.getPan()).toStrictEqual({ x: -200, y: 0 });
  });

  test("#611 a flex-centred element zooms about its layout centre, not its top-left corner", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 100, top: 50, width: 200 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 400 });
    const panzoom = createPanzoom(element);

    panzoom.zoomToPoint(2, { clientX: 200, clientY: 100 });

    expect(panzoom.getPan()).toStrictEqual({ x: 0, y: 0 });
  });

  test("#614 contain outside keeps a flex-centred element covering its parent", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 200, left: -50, top: 0, width: 400 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 300 });
    const panzoom = createPanzoom(element, { contain: PanzoomContain.Outside });

    panzoom.pan(-1000, 0);

    expect(panzoom.getPan()).toStrictEqual({ x: -50, y: 0 });
  });

  test("#668 and #669 zoom about the point at the scale the limit clamps to", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 200, left: 0, top: 0, width: 200 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element, { minScale: 1, startScale: 2 });

    panzoom.zoomToPoint(0.5, { clientX: 150, clientY: 100 });

    expect(panzoom.getPan()).toStrictEqual({ x: 25, y: 0 });
  });

  test("zoomIn and zoomOut step the scale by the step, animated unless the call says otherwise", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element);

    panzoom.zoomIn();
    const zoomedIn = panzoom.getScale();
    const transition = element.style.getPropertyValue("transition");
    panzoom.zoomOut();

    expect(zoomedIn).toBeCloseTo(Math.exp(0.3), 9);
    expect(transition).toBe("transform 200ms ease-in-out");
    expect(panzoom.getScale()).toBeCloseTo(1, 9);
  });

  test("a zoom sends panzoomzoom and then panzoomchange, both with the values after it", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element);
    const sent: CustomEvent[] = [];
    for (const name of [PanzoomEventName.Zoom, PanzoomEventName.Change])
      element.addEventListener(name, (event) => {
        sent.push(event as CustomEvent);
      });

    panzoom.zoom(2);

    expect(sent.map((event) => event.type)).toStrictEqual([PanzoomEventName.Zoom, PanzoomEventName.Change]);
    expect(sent.map((event) => event.detail.scale)).toStrictEqual([2, 2]);
  });

  test("a pan that moves neither axis sends no event", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element);
    const listener = vi.fn<(event: Event) => void>();
    element.addEventListener(PanzoomEventName.Pan, listener);

    panzoom.pan(0, 0);

    expect(listener).not.toHaveBeenCalled();
  });

  test("a silent call sends no event", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element);
    const listener = vi.fn<(event: Event) => void>();
    element.addEventListener(PanzoomEventName.Zoom, listener);

    panzoom.zoom(2, { silent: true });

    expect(listener).not.toHaveBeenCalled();
  });

  test("a destroyed panzoom sends no event, even from a listener that destroys it mid-change", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element);
    const sent: string[] = [];
    for (const name of [PanzoomEventName.Change, PanzoomEventName.Pan, PanzoomEventName.Reset, PanzoomEventName.Zoom])
      element.addEventListener(name, (event) => {
        sent.push(event.type);
      });
    element.addEventListener(PanzoomEventName.Zoom, () => {
      panzoom.destroy();
    });

    panzoom.zoom(2);
    panzoom.pan(10, 10);
    panzoom.reset();
    panzoom.fit();

    expect(sent).toStrictEqual([PanzoomEventName.Zoom]);
  });

  test("destroy restores the styles it wrote, to the values they held before", () => {
    expect.hasAssertions();

    const element = getElement();
    const parent = getParent();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(parent, { height: 200, left: 0, top: 0, width: 200 });
    parent.style.overflow = "scroll";
    const panzoom = createPanzoom(element);

    panzoom.destroy();

    expect(parent.style.getPropertyValue("overflow")).toBe("scroll");
    expect(element.style.getPropertyValue("transform")).toBe("");
  });

  test("resetStyle restores the interaction styles and leaves the transform and its origin as they are", () => {
    expect.hasAssertions();

    const element = getElement();
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(getParent(), { height: 200, left: 0, top: 0, width: 200 });
    const panzoom = createPanzoom(element);
    panzoom.zoom(2);

    panzoom.resetStyle();

    expect(getParent().style.getPropertyValue("overflow")).toBe("");
    expect(element.style.getPropertyValue("transform")).toBe("scale(2) translate(0px, 0px)");
    expect(element.style.getPropertyValue("transform-origin")).toBe("50% 50%");
  });

  test("createPanzoom refuses an element that is not attached to a document", () => {
    expect.hasAssertions();

    expect(() => createPanzoom(document.createElement("div"))).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: createPanzoom, the element is not attached to a document]`,
    );
  });

  test("createPanzoom refuses a node that is not an Element", () => {
    expect.hasAssertions();

    const element = getElement();
    Object.defineProperty(element, "nodeType", { value: Node.TEXT_NODE });

    expect(() => createPanzoom(element)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: createPanzoom, the element is not an Element]`,
    );
  });

  test("createPanzoom refuses an element with no parent element to contain it", () => {
    expect.hasAssertions();

    expect(() => createPanzoom(document.documentElement)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: createPanzoom, the element has no parent to contain it]`,
    );
  });
});
