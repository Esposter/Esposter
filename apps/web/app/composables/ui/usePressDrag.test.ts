// @vitest-environment nuxt
import { DRAG_START_DISTANCE, LONG_PRESS_MOVE_TOLERANCE, TOUCH_DRAG_DELAY_MS } from "@/services/ui/constants";
import { usePressDrag } from "@/composables/ui/usePressDrag";
import { afterEach, describe, expect, test, vi } from "vitest";

const createHandlers = () => ({
  onEnd: vi.fn<() => void>(),
  onMove: vi.fn<(point: { x: number; y: number }) => void>(),
  onRelease: vi.fn<(point: { x: number; y: number }) => void>(),
  onStart: vi.fn<() => void>(),
});

const trackPress = (event: PointerEvent, handlers: ReturnType<typeof createHandlers>) => {
  const { cancel, startPress } = usePressDrag();
  startPress(event, handlers);
  return cancel;
};

describe(usePressDrag, () => {
  const POINTER_ID = 1;
  const createPress = (pointerType: string) =>
    new PointerEvent("pointerdown", { clientX: 100, clientY: 100, pointerId: POINTER_ID, pointerType });
  const dispatch = (type: string, init: PointerEventInit = {}) =>
    window.dispatchEvent(new PointerEvent(type, { pointerId: POINTER_ID, ...init }));

  afterEach(() => {
    vi.useRealTimers();
  });

  test("a mouse press that moves the drag start distance is a drag, which a release lands", () => {
    expect.hasAssertions();

    const handlers = createHandlers();
    trackPress(createPress("mouse"), handlers);
    dispatch("pointermove", { clientX: 100 + DRAG_START_DISTANCE, clientY: 100 });
    dispatch("pointerup", { clientX: 120, clientY: 100 });

    expect(handlers.onStart).toHaveBeenCalledTimes(1);
    expect(handlers.onMove).toHaveBeenCalledWith({ x: 100 + DRAG_START_DISTANCE, y: 100 });
    expect(handlers.onRelease).toHaveBeenCalledWith({ x: 120, y: 100 });
    expect(handlers.onEnd).toHaveBeenCalledTimes(1);
  });

  test("a mouse press that never moves is a click, which lands nothing", () => {
    expect.hasAssertions();

    const handlers = createHandlers();
    trackPress(createPress("mouse"), handlers);
    dispatch("pointerup", { clientX: 100, clientY: 100 });

    expect(handlers.onStart).not.toHaveBeenCalled();
    expect(handlers.onRelease).not.toHaveBeenCalled();
    expect(handlers.onEnd).toHaveBeenCalledTimes(1);
  });

  test("a finger that drifts past the tolerance before it rests is scrolling, so its press ends", () => {
    expect.hasAssertions();

    vi.useFakeTimers();
    const handlers = createHandlers();
    trackPress(createPress("touch"), handlers);
    dispatch("pointermove", { clientX: 100 + LONG_PRESS_MOVE_TOLERANCE + 1, clientY: 100 });
    vi.advanceTimersByTime(TOUCH_DRAG_DELAY_MS);

    expect(handlers.onStart).not.toHaveBeenCalled();
    expect(handlers.onEnd).toHaveBeenCalledTimes(1);
  });

  test("a finger that rests the touch delay starts its drag where it rests", () => {
    expect.hasAssertions();

    vi.useFakeTimers();
    const handlers = createHandlers();
    trackPress(createPress("touch"), handlers);
    vi.advanceTimersByTime(TOUCH_DRAG_DELAY_MS);

    expect(handlers.onStart).toHaveBeenCalledTimes(1);
    expect(handlers.onMove).toHaveBeenCalledWith({ x: 100, y: 100 });
  });

  test("escape ends a drag in progress and lands nothing, and goes no further", () => {
    expect.hasAssertions();

    const handlers = createHandlers();
    trackPress(createPress("mouse"), handlers);
    dispatch("pointermove", { clientX: 100 + DRAG_START_DISTANCE, clientY: 100 });
    const escape = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Escape" });
    window.dispatchEvent(escape);
    dispatch("pointerup", { clientX: 120, clientY: 100 });

    expect(escape.defaultPrevented).toBe(true);
    expect(handlers.onRelease).not.toHaveBeenCalled();
    expect(handlers.onEnd).toHaveBeenCalledTimes(1);
  });

  test("a move of another pointer is not this press's", () => {
    expect.hasAssertions();

    const handlers = createHandlers();
    trackPress(createPress("mouse"), handlers);
    dispatch("pointermove", { clientX: 200, clientY: 100, pointerId: POINTER_ID + 1 });

    expect(handlers.onStart).not.toHaveBeenCalled();
  });

  test("the click that follows a drag's release is swallowed", () => {
    expect.hasAssertions();

    const handlers = createHandlers();
    trackPress(createPress("mouse"), handlers);
    dispatch("pointermove", { clientX: 100 + DRAG_START_DISTANCE, clientY: 100 });
    dispatch("pointerup", { clientX: 120, clientY: 100 });
    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    window.dispatchEvent(click);

    expect(click.defaultPrevented).toBe(true);
  });

  test("the returned cancel ends a press with nothing landed", () => {
    expect.hasAssertions();

    const handlers = createHandlers();
    const cancel = trackPress(createPress("mouse"), handlers);
    dispatch("pointermove", { clientX: 100 + DRAG_START_DISTANCE, clientY: 100 });
    cancel();
    dispatch("pointerup", { clientX: 120, clientY: 100 });

    expect(handlers.onRelease).not.toHaveBeenCalled();
    expect(handlers.onEnd).toHaveBeenCalledTimes(1);
  });

  test("the drag's state is held while the press is a drag, and cleared when it ends", () => {
    expect.hasAssertions();

    const { isDragging, point, startPress } = usePressDrag();
    startPress(createPress("mouse"));
    dispatch("pointermove", { clientX: 100 + DRAG_START_DISTANCE, clientY: 100 });

    expect(isDragging.value).toBe(true);
    expect(point.value).toStrictEqual({ x: 100 + DRAG_START_DISTANCE, y: 100 });

    dispatch("pointerup", { clientX: 120, clientY: 100 });

    expect(isDragging.value).toBe(false);
    expect(point.value).toBeUndefined();
  });
});
