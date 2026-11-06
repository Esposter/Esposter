import { PressMoveOutcome } from "@/models/ui/PressMoveOutcome";
import { DRAG_START_DISTANCE, LONG_PRESS_MOVE_TOLERANCE } from "@/services/ui/constants";
import { getPressMoveOutcome } from "@/services/ui/getPressMoveOutcome";
import { describe, expect, test } from "vitest";

describe(getPressMoveOutcome, () => {
  test("a mouse press starts its drag once it moves past the threshold", () => {
    expect.hasAssertions();

    expect(getPressMoveOutcome("mouse", DRAG_START_DISTANCE)).toBe(PressMoveOutcome.Start);
  });

  test("a mouse press inside the threshold is still a click", () => {
    expect.hasAssertions();

    expect(getPressMoveOutcome("mouse", DRAG_START_DISTANCE - 1)).toBe(PressMoveOutcome.Wait);
  });

  test("a finger that drifts past the tolerance before it rests is scrolling, so its press is cancelled", () => {
    expect.hasAssertions();

    expect(getPressMoveOutcome("touch", LONG_PRESS_MOVE_TOLERANCE + 1)).toBe(PressMoveOutcome.Cancel);
  });

  test("a finger inside the tolerance waits for its rest, which starts the drag", () => {
    expect.hasAssertions();

    expect(getPressMoveOutcome("touch", LONG_PRESS_MOVE_TOLERANCE)).toBe(PressMoveOutcome.Wait);
  });
});
