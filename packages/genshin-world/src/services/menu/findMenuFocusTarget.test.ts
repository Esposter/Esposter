import { MenuDirection } from "#src/models/menu/MenuDirection";
import { findMenuFocusTarget } from "#src/services/menu/findMenuFocusTarget";
import { describe, expect, test } from "vitest";

// A ten-pixel square control, from its left and top edge
const createBox = (left: number, top: number) => ({ bottom: top + 10, left, right: left + 10, top });

describe(findMenuFocusTarget, () => {
  // Three controls in a row, with one below the first
  const rectangles = [createBox(0, 0), createBox(20, 0), createBox(40, 0), createBox(0, 30)];

  test("moves to the nearest control lying that way", () => {
    expect.hasAssertions();

    expect({
      down: findMenuFocusTarget(rectangles, 0, MenuDirection.Down),
      right: findMenuFocusTarget(rectangles, 0, MenuDirection.Right),
    }).toStrictEqual({ down: 3, right: 1 });
  });

  test("prefers the control in line with the focus over a nearer one off the line", () => {
    expect.hasAssertions();

    const offLine = [createBox(0, 0), createBox(15, 30), createBox(50, 0)];

    expect(findMenuFocusTarget(offLine, 0, MenuDirection.Right)).toBe(2);
  });

  test("is undefined when no control lies that way", () => {
    expect.hasAssertions();

    expect(findMenuFocusTarget(rectangles, 0, MenuDirection.Left)).toBeUndefined();
  });
});
