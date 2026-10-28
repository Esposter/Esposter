// @vitest-environment happy-dom
import {
  DRAG_AUTOSCROLL_EDGE,
  DRAG_START_DISTANCE,
  REORDER_GHOST_CLASS,
  REORDER_SLIDE_TRANSITION,
  TOUCH_DRAG_DELAY_MS,
} from "@/services/ui/constants";
import { takeOne } from "@esposter/shared";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// How far a row sits from its own slot, read off the style the drag writes
const getTranslate = (element: HTMLElement) => Number(element.style.translate.split(" ")[1]?.replace("px", "") ?? 0);
const mountRows = (initialValues: string[], handle?: string) => {
  const order = ref(initialValues);
  const onReorder = vi.fn<(newValues: string[]) => void>((newValues) => {
    order.value = newValues;
  });
  const component = mount(
    defineComponent({
      setup: () => {
        const getDragReorderProps = useDragReorder();
        return () =>
          h("div", { "data-scroller": "", style: { overflowY: "auto" } }, [
            h(
              "div",
              { "data-container": "", ...getDragReorderProps(order.value, onReorder, handle) },
              order.value.map((value) =>
                h("div", { "data-value": value, key: value }, [
                  h("span", { class: "handle" }, [h("svg")]),
                  h("input"),
                  h("span", { class: "text" }, value),
                ]),
              ),
            ),
          ]);
      },
    }),
    { attachTo: window.document.body },
  );
  const getRows = () => component.findAll<HTMLElement>("[data-value]").map(({ element }) => element);
  const getRow = (value: string) => component.get<HTMLElement>(`[data-value="${value}"]`).element;
  const getRowCenter = (value: string) => {
    const { height, top } = getRow(value).getBoundingClientRect();
    return top + height / 2;
  };
  return { component, getRow, getRowCenter, getRows, onReorder, order };
};
const click = (element: Element) => {
  const event = new MouseEvent("click", { bubbles: true, cancelable: true });
  element.dispatchEvent(event);
  return event;
};

describe(useDragReorder, () => {
  const containerTop = 100;
  const rowHeight = 40;
  const scrollerHeight = 200;
  const values = ["a", "b", "c"];
  const pointerId = 1;
  const getRowHeight = (element: HTMLElement) => Number(element.dataset.height ?? rowHeight);
  // A layout for happy-dom, which lays nothing out: rows stack down from the container's top at their own heights,
  // Each moved by its translate, scaled by the container's scale and scrolled by the scroller and the page
  const getRect = (element: HTMLElement) => {
    const scroller = element.closest<HTMLElement>("[data-scroller]");
    if (element === scroller) return new DOMRect(0, 0, 100, scrollerHeight);
    const container = element.closest<HTMLElement>("[data-container]");
    const scroll = (scroller?.scrollTop ?? 0) + window.document.documentElement.scrollTop;
    const scale = Number(container?.dataset.scale ?? 1);
    if (!container) return new DOMRect();
    const rows = [...container.children].filter((child) => child instanceof HTMLElement);
    if (element === container)
      return new DOMRect(0, containerTop - scroll, 100, rows.reduce((sum, row) => sum + getRowHeight(row), 0) * scale);
    if (element.parentElement !== container) return new DOMRect();
    const above = rows.slice(0, rows.indexOf(element)).reduce((sum, row) => sum + getRowHeight(row), 0);
    return new DOMRect(
      0,
      containerTop + (above + getTranslate(element)) * scale - scroll,
      100,
      getRowHeight(element) * scale,
    );
  };
  const createPointerEvent = (type: string, clientY: number, init: PointerEventInit = {}) =>
    new PointerEvent(type, {
      bubbles: true,
      button: 0,
      cancelable: true,
      clientY,
      isPrimary: true,
      pointerId,
      pointerType: "mouse",
      ...init,
    });
  // A mouse press on a row's text that moves far enough to drag
  const startDrag = (row: HTMLElement, clientY: number) => {
    row.querySelector(".text")?.dispatchEvent(createPointerEvent("pointerdown", clientY));
    window.dispatchEvent(createPointerEvent("pointermove", clientY + DRAG_START_DISTANCE));
  };
  const movePointer = (clientY: number, init?: PointerEventInit) => {
    window.dispatchEvent(createPointerEvent("pointermove", clientY, init));
  };
  const release = (clientY: number, init?: PointerEventInit) => {
    window.dispatchEvent(createPointerEvent("pointerup", clientY, init));
  };

  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      return getRect(this);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("sortablejs#1482 a mouse press drags only once it moves past the start distance, and one released short of it is a click", () => {
    expect.hasAssertions();

    const { getRow, getRowCenter, onReorder } = mountRows(values);
    const row = getRow("a");
    const center = getRowCenter("a");
    row.querySelector(".text")?.dispatchEvent(createPointerEvent("pointerdown", center));
    movePointer(center + DRAG_START_DISTANCE - 1);

    expect(row.classList.contains(REORDER_GHOST_CLASS)).toBe(false);

    release(center + DRAG_START_DISTANCE - 1);

    expect(click(row).defaultPrevented).toBe(false);
    expect(onReorder).not.toHaveBeenCalled();
  });

  test("sortablejs#56 a touch drags only once it has rested the delay", () => {
    expect.hasAssertions();

    const { getRow, getRowCenter } = mountRows(values);
    const row = getRow("a");
    row
      .querySelector(".text")
      ?.dispatchEvent(createPointerEvent("pointerdown", getRowCenter("a"), { pointerType: "touch" }));
    vi.advanceTimersByTime(TOUCH_DRAG_DELAY_MS - 1);

    expect(row.classList.contains(REORDER_GHOST_CLASS)).toBe(false);

    vi.advanceTimersByTime(1);

    expect(row.classList.contains(REORDER_GHOST_CLASS)).toBe(true);
  });

  test("sortablejs#27 a touch that moves before the delay is a scroll and never drags", () => {
    expect.hasAssertions();

    const { getRow, getRowCenter } = mountRows(values);
    const row = getRow("a");
    const center = getRowCenter("a");
    row.querySelector(".text")?.dispatchEvent(createPointerEvent("pointerdown", center, { pointerType: "touch" }));
    movePointer(center + rowHeight, { pointerType: "touch" });
    vi.advanceTimersByTime(TOUCH_DRAG_DELAY_MS);

    expect(row.classList.contains(REORDER_GHOST_CLASS)).toBe(false);
  });

  test.each<[string, PointerEventInit]>([
    ["a secondary button", { button: 2 }],
    ["a second finger", { isPrimary: false, pointerType: "touch" }],
  ])("sortablejs#93 a press with %s never drags", (_description, init) => {
    expect.hasAssertions();

    const { getRow, getRowCenter } = mountRows(values);
    const row = getRow("a");
    const center = getRowCenter("a");
    row.querySelector(".text")?.dispatchEvent(createPointerEvent("pointerdown", center, init));
    vi.advanceTimersByTime(TOUCH_DRAG_DELAY_MS);
    movePointer(center + rowHeight, init);

    expect(row.classList.contains(REORDER_GHOST_CLASS)).toBe(false);
  });

  test("vue-draggable-plus#68 with a handle only a press inside it drags, an icon nested in it included", () => {
    expect.hasAssertions();

    const { getRow, getRowCenter } = mountRows(values, ".handle");
    const row = getRow("a");
    const center = getRowCenter("a");
    startDrag(row, center);

    expect(row.classList.contains(REORDER_GHOST_CLASS)).toBe(false);

    release(center);
    row.querySelector(".handle svg")?.dispatchEvent(createPointerEvent("pointerdown", center));
    movePointer(center + DRAG_START_DISTANCE);

    expect(row.classList.contains(REORDER_GHOST_CLASS)).toBe(true);
  });

  test("sortablejs#972 a press in a field inside a row never drags, so its caret and selection stay its own", () => {
    expect.hasAssertions();

    const { getRow, getRowCenter } = mountRows(values);
    const row = getRow("a");
    const center = getRowCenter("a");
    const pointerdown = createPointerEvent("pointerdown", center);
    row.querySelector("input")?.dispatchEvent(pointerdown);
    const selectstart = new Event("selectstart", { bubbles: true, cancelable: true });
    row.querySelector("input")?.dispatchEvent(selectstart);
    movePointer(center + rowHeight);

    expect(row.classList.contains(REORDER_GHOST_CLASS)).toBe(false);
    expect(pointerdown.defaultPrevented).toBe(false);
    expect(selectstart.defaultPrevented).toBe(false);
  });

  test("sortablejs#328 in nested containers the innermost takes the press, and its row moves only among its own", () => {
    expect.hasAssertions();

    const outerOrder = ref(["outer"]);
    const innerOrder = ref(["a", "b"]);
    const onOuterReorder = vi.fn<(newValues: string[]) => void>();
    const onInnerReorder = vi.fn<(newValues: string[]) => void>();
    const component = mount(
      defineComponent({
        setup: () => {
          const getOuterProps = useDragReorder();
          const getInnerProps = useDragReorder();
          return () =>
            h("div", getOuterProps(outerOrder.value, onOuterReorder), [
              h("div", { "data-value": "outer" }, [
                h(
                  "div",
                  { "data-container": "", ...getInnerProps(innerOrder.value, onInnerReorder) },
                  innerOrder.value.map((value) => h("div", { "data-value": value, key: value }, value)),
                ),
              ]),
            ]);
        },
      }),
      { attachTo: window.document.body },
    );
    const innerRow = component.get<HTMLElement>('[data-value="a"]').element;
    const outerRow = component.get<HTMLElement>('[data-value="outer"]').element;
    const center = containerTop + rowHeight / 2;
    innerRow.dispatchEvent(createPointerEvent("pointerdown", center));
    movePointer(center + rowHeight);

    expect(innerRow.classList.contains(REORDER_GHOST_CLASS)).toBe(true);
    expect(outerRow.classList.contains(REORDER_GHOST_CLASS)).toBe(false);

    release(center + rowHeight);

    expect(onInnerReorder).toHaveBeenCalledExactlyOnceWith(["b", "a"]);
    expect(onOuterReorder).not.toHaveBeenCalled();
  });

  test("vue-draggable-plus#252 the held row itself follows the pointer inside its container, keeping its own transform", () => {
    expect.hasAssertions();

    const { getRow, getRowCenter } = mountRows(values);
    const row = getRow("a");
    const center = getRowCenter("a");
    row.style.transform = "rotate(1deg)";
    startDrag(row, center);
    movePointer(center + rowHeight / 2);

    expect(getTranslate(row)).toBe(rowHeight / 2);
    expect(row.style.transform).toBe("rotate(1deg)");
    expect(row.style.transition).toBe("none");

    movePointer(center + rowHeight * values.length);

    expect(getTranslate(row)).toBe(rowHeight * (values.length - 1));

    movePointer(center - rowHeight);

    expect(getTranslate(row)).toBe(0);
  });

  test("vue-draggable-plus#167 the rows the held one passes slide aside by its height with the short motion", () => {
    expect.hasAssertions();

    const { getRow, getRowCenter } = mountRows(values);
    const row = getRow("a");
    const center = getRowCenter("a");
    startDrag(row, center);
    movePointer(center + rowHeight * 2);

    expect([getTranslate(getRow("b")), getTranslate(getRow("c"))]).toStrictEqual([-rowHeight, -rowHeight]);
    expect(getRow("b").style.transition).toBe(REORDER_SLIDE_TRANSITION);

    movePointer(center + rowHeight);

    expect([getTranslate(getRow("b")), getTranslate(getRow("c"))]).toStrictEqual([-rowHeight, 0]);
  });

  test("sortablejs#1686 the held row takes the slot nearest where it is held, so rows of unequal height change places once", () => {
    expect.hasAssertions();

    const { getRow, getRowCenter } = mountRows(values);
    getRow("a").dataset.height = String(rowHeight * 2);
    const row = getRow("a");
    const center = getRowCenter("a");
    startDrag(row, center);
    // Past the midpoint of the first slot below, which is the short row's own height away
    movePointer(center + rowHeight / 2 + 1);
    movePointer(center + rowHeight / 2 + 1);

    expect(getTranslate(getRow("b"))).toBe(-rowHeight * 2);

    movePointer(center + rowHeight * 10);

    expect(getTranslate(getRow("c"))).toBe(-rowHeight * 2);
  });

  test("vue-draggable-plus#35 a press never starts the browser's own drag, so no browser opens a tab or a search", () => {
    expect.hasAssertions();

    const { getRow, getRowCenter } = mountRows(values);
    const row = getRow("a");
    startDrag(row, getRowCenter("a"));
    const dragstart = new Event("dragstart", { bubbles: true, cancelable: true });
    row.dispatchEvent(dragstart);

    expect(dragstart.defaultPrevented).toBe(true);
  });

  test("sortablejs#997 no text is selected while a press is down", () => {
    expect.hasAssertions();

    const { getRow, getRowCenter } = mountRows(values);
    const row = getRow("a");
    row.querySelector(".text")?.dispatchEvent(createPointerEvent("pointerdown", getRowCenter("a")));
    const selectstart = new Event("selectstart", { bubbles: true, cancelable: true });
    row.dispatchEvent(selectstart);

    expect(selectstart.defaultPrevented).toBe(true);
  });

  test("vue-draggable-plus#62 inside a scaled ancestor the held row stays under the pointer", () => {
    expect.hasAssertions();

    const scale = 2;
    const { component, getRow, getRowCenter } = mountRows(values);
    const container = component.get<HTMLElement>("[data-container]").element;
    container.dataset.scale = String(scale);
    vi.spyOn(container, "offsetHeight", "get").mockReturnValue(rowHeight * values.length);
    const row = getRow("a");
    const center = getRowCenter("a");
    startDrag(row, center);
    movePointer(center + rowHeight * scale);

    expect(row.getBoundingClientRect().top).toBe(containerTop + rowHeight * scale);
    expect(getTranslate(getRow("b"))).toBe(-rowHeight);
  });

  test("vue-draggable-plus#251 a scroll under the drag keeps the held row under the pointer and its slot right", () => {
    expect.hasAssertions();

    const { component, getRow, getRowCenter } = mountRows(values);
    const scroller = component.get<HTMLElement>("[data-scroller]").element;
    const row = getRow("a");
    const center = getRowCenter("a");
    startDrag(row, center);
    scroller.scrollTop = rowHeight;
    scroller.dispatchEvent(new Event("scroll"));

    expect(getTranslate(row)).toBe(rowHeight + DRAG_START_DISTANCE);
    expect(getTranslate(getRow("b"))).toBe(-rowHeight);
  });

  test("vue-draggable-plus#151 the nearest scroller scrolls while the pointer is near its edge, faster nearer it, and stops once it leaves", () => {
    expect.hasAssertions();

    const { component, getRow, getRowCenter } = mountRows(values);
    const scroller = component.get<HTMLElement>("[data-scroller]").element;
    vi.spyOn(scroller, "clientHeight", "get").mockReturnValue(scrollerHeight);
    vi.spyOn(scroller, "scrollHeight", "get").mockReturnValue(scrollerHeight * 10);
    const scrollBy = vi.spyOn(scroller, "scrollBy");
    startDrag(getRow("a"), getRowCenter("a"));
    // Halfway into the edge, then at it
    movePointer(scrollerHeight - DRAG_AUTOSCROLL_EDGE / 2);
    vi.advanceTimersToNextFrame();
    vi.advanceTimersToNextFrame();
    movePointer(scrollerHeight);
    vi.advanceTimersToNextFrame();
    movePointer(scrollerHeight / 2);
    vi.advanceTimersToNextFrame();
    vi.advanceTimersToNextFrame();

    expect(scrollBy.mock.calls).toStrictEqual([1, 8, 16].map((top) => [{ behavior: "instant", top }]));
  });

  test("sortablejs#1240 autoscroll keeps going at full speed with the pointer past the scroller's edge", () => {
    expect.hasAssertions();

    const { component, getRow, getRowCenter } = mountRows(values);
    const scroller = component.get<HTMLElement>("[data-scroller]").element;
    vi.spyOn(scroller, "clientHeight", "get").mockReturnValue(scrollerHeight);
    vi.spyOn(scroller, "scrollHeight", "get").mockReturnValue(scrollerHeight * 10);
    const scrollBy = vi.spyOn(scroller, "scrollBy");
    const row = getRow("a");
    startDrag(row, getRowCenter("a"));
    movePointer(scrollerHeight * 2);
    vi.advanceTimersToNextFrame();

    expect(scrollBy).toHaveBeenCalledExactlyOnceWith({ behavior: "instant", top: 1 });
    expect(getTranslate(row)).toBe(rowHeight * (values.length - 1));
  });

  test("sortablejs#2069 the drag holds the pointer, so nothing else takes its events", () => {
    expect.hasAssertions();

    const { getRow, getRowCenter } = mountRows(values);
    const row = getRow("a");
    startDrag(row, getRowCenter("a"));

    expect(row.hasPointerCapture(pointerId)).toBe(true);
  });

  test("vue-draggable-plus#113 the held row wears the ghost class from the drag's start to its release, and a press that never drags sets nothing", () => {
    expect.hasAssertions();

    const { getRow, getRowCenter } = mountRows(values);
    const row = getRow("a");
    const center = getRowCenter("a");
    row.querySelector(".text")?.dispatchEvent(createPointerEvent("pointerdown", center));

    expect(row.getAttribute("class")).toBeNull();
    expect(row.getAttribute("style")).toBeNull();

    movePointer(center + DRAG_START_DISTANCE);

    expect(row.classList.contains(REORDER_GHOST_CLASS)).toBe(true);

    release(center + DRAG_START_DISTANCE);

    expect(row.classList.contains(REORDER_GHOST_CLASS)).toBe(false);
  });

  test("sortablejs#973 once a touch drag starts the page holds still under the finger, and not before", () => {
    expect.hasAssertions();

    const { component, getRow, getRowCenter } = mountRows(values);
    const container = component.get<HTMLElement>("[data-container]").element;
    const row = getRow("a");
    row
      .querySelector(".text")
      ?.dispatchEvent(createPointerEvent("pointerdown", getRowCenter("a"), { pointerType: "touch" }));
    const earlyTouchmove = new TouchEvent("touchmove", { bubbles: true, cancelable: true });
    container.dispatchEvent(earlyTouchmove);
    vi.advanceTimersByTime(TOUCH_DRAG_DELAY_MS);
    const touchmove = new TouchEvent("touchmove", { bubbles: true, cancelable: true });
    container.dispatchEvent(touchmove);

    expect(earlyTouchmove.defaultPrevented).toBe(false);
    expect(touchmove.defaultPrevented).toBe(true);
  });

  test("vue-draggable-plus#173 a drop hands one new order to the call site and moves no row in the DOM", async () => {
    expect.hasAssertions();

    const { component, getRow, getRowCenter, getRows, onReorder, order } = mountRows(values);
    const center = getRowCenter("a");
    startDrag(getRow("a"), center);
    movePointer(center + rowHeight * 2);
    release(center + rowHeight * 2);

    expect(getRows().map((row) => row.dataset.value)).toStrictEqual(values);
    expect(onReorder).toHaveBeenCalledExactlyOnceWith(["b", "c", "a"]);

    order.value = [...order.value, "d"];
    await nextTick();

    expect(component.findAll("[data-value]").map((row) => row.attributes("data-value"))).toStrictEqual([
      "b",
      "c",
      "a",
      "d",
    ]);
  });

  test("sortablejs#410 a drop that leaves the order unchanged emits nothing", () => {
    expect.hasAssertions();

    const { getRow, getRowCenter, onReorder } = mountRows(values);
    const center = getRowCenter("a");
    startDrag(getRow("a"), center);
    movePointer(center + rowHeight * 2);
    movePointer(center);
    release(center);

    expect(onReorder).not.toHaveBeenCalled();
  });

  test("sortablejs#1804 on release every row slides from where it was let go into the slot the call site renders it in, and the drag's styles come off", async () => {
    expect.hasAssertions();

    const { getRow, getRowCenter, getRows, onReorder, order } = mountRows(values);
    // The new order lands a microtask on, as an optimistic store's write does, after the release has returned
    onReorder.mockImplementation((newValues) => {
      queueMicrotask(() => {
        order.value = newValues;
      });
    });
    const row = getRow("a");
    const center = getRowCenter("a");
    // Each style the row wore once the drop began, as its translate and its transition
    const styles: [string, string][] = [];
    const observer = new MutationObserver((records) => {
      for (const { oldValue } of records) {
        const element = window.document.createElement("div");
        element.setAttribute("style", oldValue ?? "");
        styles.push([element.style.translate, element.style.transition]);
      }
    });
    startDrag(row, center);
    // Let go short of the third slot, which it takes as the nearest
    movePointer(center + rowHeight * 2 - DRAG_START_DISTANCE);
    observer.observe(row, { attributeFilter: ["style"], attributeOldValue: true });
    release(center + rowHeight * 2 - DRAG_START_DISTANCE);
    await flushPromises();
    vi.advanceTimersToNextFrame();
    await flushPromises();
    observer.disconnect();

    expect(styles).toContainEqual([`0 ${-DRAG_START_DISTANCE}px`, "none"]);
    expect(styles).toContainEqual([`0 ${-DRAG_START_DISTANCE}px`, REORDER_SLIDE_TRANSITION]);
    expect(getRows().map((element) => element.getAttribute("style") ?? "")).toStrictEqual(["", "", ""]);
  });

  test("sortablejs#1184 the click a drop raises is swallowed, and only that one", () => {
    expect.hasAssertions();

    const { getRow, getRowCenter } = mountRows(values);
    const row = getRow("a");
    const center = getRowCenter("a");
    startDrag(row, center);
    release(center);

    expect(click(row).defaultPrevented).toBe(true);
    expect(click(row).defaultPrevented).toBe(false);
  });

  test("sortablejs#2365 after a drop that raises no click, the next press's click still fires", () => {
    expect.hasAssertions();

    const { getRow, getRowCenter } = mountRows(values);
    const row = getRow("a");
    const center = getRowCenter("a");
    startDrag(row, center);
    release(center);
    row.dispatchEvent(createPointerEvent("pointerdown", center, { pointerId: pointerId + 1 }));
    release(center, { pointerId: pointerId + 1 });

    expect(click(row).defaultPrevented).toBe(false);
  });

  test("vue-draggable-plus#105 Escape cancels the drag, puts every row back and goes no further", () => {
    expect.hasAssertions();

    const { getRow, getRowCenter, getRows, onReorder } = mountRows(values);
    const onKeydown = vi.fn<(event: KeyboardEvent) => void>();
    window.document.body.addEventListener("keydown", onKeydown);
    const center = getRowCenter("a");
    startDrag(getRow("a"), center);
    movePointer(center + rowHeight * 2);
    window.document.body.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Escape" }),
    );
    vi.advanceTimersToNextFrame();

    expect(getRows().map((row) => getTranslate(row))).toStrictEqual([0, 0, 0]);
    expect(onKeydown).not.toHaveBeenCalled();

    movePointer(center + rowHeight);
    release(center + rowHeight);

    expect(onReorder).not.toHaveBeenCalled();
    expect(click(getRow("a")).defaultPrevented).toBe(true);

    window.document.body.removeEventListener("keydown", onKeydown);
  });

  test("sortablejs#49 a pointercancel cancels the drag, puts every row back and emits nothing", () => {
    expect.hasAssertions();

    const { getRow, getRowCenter, getRows, onReorder } = mountRows(values);
    const center = getRowCenter("a");
    startDrag(getRow("a"), center);
    movePointer(center + rowHeight * 2);
    window.dispatchEvent(createPointerEvent("pointercancel", center + rowHeight * 2));
    release(center + rowHeight * 2);
    vi.advanceTimersToNextFrame();

    expect(getRows().map((row) => getTranslate(row))).toStrictEqual([0, 0, 0]);
    expect(onReorder).not.toHaveBeenCalled();
  });

  test("vue-draggable-plus#265 unmounting mid-drag ends it and leaves no listener behind", () => {
    expect.hasAssertions();

    const addEventListener = vi.spyOn(window, "addEventListener");
    const { component, getRow, getRowCenter, onReorder } = mountRows(values);

    expect(addEventListener).not.toHaveBeenCalled();

    const center = getRowCenter("a");
    startDrag(getRow("a"), center);
    movePointer(center + rowHeight * 2);
    component.unmount();
    release(center + rowHeight * 2);

    expect(
      addEventListener.mock.calls.map(({ 2: options }) => typeof options === "object" && options.signal?.aborted),
    ).toStrictEqual(addEventListener.mock.calls.map(() => true));
    expect(onReorder).not.toHaveBeenCalled();
  });

  test("vue-draggable-plus#12 a list replaced after mount reorders from its current rows", async () => {
    expect.hasAssertions();

    const { getRow, getRowCenter, onReorder, order } = mountRows(["x"]);
    order.value = values;
    await nextTick();
    const center = getRowCenter("a");
    startDrag(getRow("a"), center);
    movePointer(center + rowHeight);
    release(center + rowHeight);

    expect(onReorder).toHaveBeenCalledExactlyOnceWith(["b", "a", "c"]);
  });

  test("a row added under a drag cancels it, since its slots are stale", async () => {
    expect.hasAssertions();

    const { getRow, getRowCenter, getRows, onReorder, order } = mountRows(values);
    const center = getRowCenter("a");
    startDrag(getRow("a"), center);
    movePointer(center + rowHeight * 2);
    order.value = [...order.value, "d"];
    await flushPromises();
    release(center + rowHeight * 2);
    vi.advanceTimersToNextFrame();

    expect(getRows().map((row) => getTranslate(row))).toStrictEqual([0, 0, 0, 0]);
    expect(onReorder).not.toHaveBeenCalled();
    expect(takeOne(getRows(), 0).classList.contains(REORDER_GHOST_CLASS)).toBe(false);
  });
});
