import { getPressMoveOutcome } from "@/services/pageBuilder/getPressMoveOutcome";
import { DRAG_START_DISTANCE } from "@/services/ui/constants";
import { describe, expect, test } from "vitest";

describe(getPressMoveOutcome, () => {
  test("a mouse press starts its drag once it moves past the threshold", () => {
    expect.hasAssertions();

    expect(getPressMoveOutcome("mouse", DRAG_START_DISTANCE)).toBe("start");
  });

  test("a mouse press inside the threshold is still a click", () => {
    expect.hasAssertions();

    expect(getPressMoveOutcome("mouse", DRAG_START_DISTANCE - 1)).toBe("wait");
  });

  test("a finger that moves past the threshold before it rests is scrolling, so its press is cancelled", () => {
    expect.hasAssertions();

    expect(getPressMoveOutcome("touch", DRAG_START_DISTANCE)).toBe("cancel");
  });

  test("a finger inside the threshold waits for its rest, which starts the drag", () => {
    expect.hasAssertions();

    expect(getPressMoveOutcome("touch", DRAG_START_DISTANCE - 1)).toBe("wait");
  });
});
