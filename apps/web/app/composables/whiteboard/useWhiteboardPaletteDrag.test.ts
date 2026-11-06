// @vitest-environment happy-dom
import type { WhiteboardPaletteItem } from "@/models/whiteboard/WhiteboardPaletteItem";
import type { Point } from "headless-block-editor";

import { useWhiteboardPaletteDrag } from "@/composables/whiteboard/useWhiteboardPaletteDrag";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { DRAG_START_DISTANCE, LONG_PRESS_MOVE_TOLERANCE, TOUCH_DRAG_DELAY_MS } from "@/services/ui/constants";
import { mount } from "@vue/test-utils";
import { PositionedElementType, ShapeKind } from "headless-block-editor";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const createPointerEvent = (type: string, x: number, y: number, init?: PointerEventInit) =>
  new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, ...init });

describe(useWhiteboardPaletteDrag, () => {
  const item: WhiteboardPaletteItem = { kind: ShapeKind.Process, title: "Process", type: PositionedElementType.Shape };
  const mountDrag = (onRelease: (item: WhiteboardPaletteItem, point: Point) => void) =>
    mount(defineComponent({ render: () => h("div"), setup: () => useWhiteboardPaletteDrag(onRelease) }));
  const press = (drag: ReturnType<typeof mountDrag>, x: number, y: number, pointerType = "mouse") =>
    drag.vm.startDrag(item, createPointerEvent("pointerdown", x, y, { pointerType }));
  const move = (x: number, y: number, pointerType = "mouse") =>
    window.dispatchEvent(createPointerEvent("pointermove", x, y, { pointerType }));
  const release = (x: number, y: number) => window.dispatchEvent(createPointerEvent("pointerup", x, y));

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("a press that does not pass the drag start distance is a click, so a release places nothing", () => {
    expect.hasAssertions();

    const onRelease = vi.fn<(item: WhiteboardPaletteItem, point: Point) => void>();
    const drag = mountDrag(onRelease);
    press(drag, 10, 10);
    move(10 + DRAG_START_DISTANCE - 1, 10);
    release(10, 10);

    expect(drag.vm.ghost).toBeUndefined();
    expect(onRelease).not.toHaveBeenCalled();
  });

  test("a press past the drag start distance shows the item at the pointer, and a release hands over its point", () => {
    expect.hasAssertions();

    const onRelease = vi.fn<(item: WhiteboardPaletteItem, point: Point) => void>();
    const drag = mountDrag(onRelease);
    press(drag, 10, 10);
    move(10 + DRAG_START_DISTANCE, 10);

    expect(drag.vm.ghost).toStrictEqual({
      icon: UiIconMeaning.Settings,
      point: { x: 10 + DRAG_START_DISTANCE, y: 10 },
      title: "Process",
    });

    release(200, 120);

    expect(onRelease).toHaveBeenCalledWith(item, { x: 200, y: 120 });
    expect(drag.vm.ghost).toBeUndefined();
  });

  test("the click a release raises on the tile is swallowed, and the one after it is not", () => {
    expect.hasAssertions();

    const tile = document.createElement("button");
    document.body.append(tile);
    const onClick = vi.fn<() => void>();
    tile.addEventListener("click", onClick);
    const drag = mountDrag(vi.fn<(item: WhiteboardPaletteItem, point: Point) => void>());
    press(drag, 10, 10);
    move(10 + DRAG_START_DISTANCE, 10);
    release(10 + DRAG_START_DISTANCE, 10);
    tile.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    expect(onClick).not.toHaveBeenCalled();

    vi.runOnlyPendingTimers();
    tile.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    expect(onClick).toHaveBeenCalledOnce();
    tile.remove();
  });

  test("Escape cancels a drag, so the release after it places nothing", () => {
    expect.hasAssertions();

    const onRelease = vi.fn<(item: WhiteboardPaletteItem, point: Point) => void>();
    const drag = mountDrag(onRelease);
    press(drag, 10, 10);
    move(10 + DRAG_START_DISTANCE, 10);
    window.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Escape" }));

    expect(drag.vm.ghost).toBeUndefined();

    release(200, 120);

    expect(onRelease).not.toHaveBeenCalled();
  });

  test("a finger that moves before the touch delay is scrolling, so the press ends and no later move drags", () => {
    expect.hasAssertions();

    const onRelease = vi.fn<(item: WhiteboardPaletteItem, point: Point) => void>();
    const drag = mountDrag(onRelease);
    press(drag, 10, 10, "touch");
    move(10 + LONG_PRESS_MOVE_TOLERANCE + 1, 10, "touch");
    vi.advanceTimersByTime(TOUCH_DRAG_DELAY_MS);
    move(100, 10, "touch");

    expect(drag.vm.ghost).toBeUndefined();
  });

  test("a finger drags once it has rested for the touch delay, and holds the page still while it does", () => {
    expect.hasAssertions();

    const onRelease = vi.fn<(item: WhiteboardPaletteItem, point: Point) => void>();
    const drag = mountDrag(onRelease);
    press(drag, 10, 10, "touch");
    move(10 + DRAG_START_DISTANCE, 10, "touch");

    expect(drag.vm.ghost).toBeUndefined();

    vi.advanceTimersByTime(TOUCH_DRAG_DELAY_MS);
    move(10 + DRAG_START_DISTANCE + 1, 10, "touch");

    expect(drag.vm.ghost).toBeDefined();

    const touchmove = new Event("touchmove", { cancelable: true });
    window.dispatchEvent(touchmove);

    expect(touchmove.defaultPrevented).toBe(true);

    release(200, 120);

    expect(onRelease).toHaveBeenCalledWith(item, { x: 200, y: 120 });
  });
});
