// @vitest-environment happy-dom
import { pressKey } from "@/services/whiteboard/constants.test";
import { getTextEditAction } from "@/services/whiteboard/text/getTextEditAction";
import { describe, expect, test } from "vitest";

describe(getTextEditAction, () => {
  test("an input-method composition keeps Enter and Escape for itself", () => {
    expect.hasAssertions();

    expect(getTextEditAction(pressKey({ isComposing: true, key: "Enter" }))).toBeUndefined();
    expect(getTextEditAction(pressKey({ isComposing: true, key: "Escape" }))).toBeUndefined();
  });

  test("shift with Enter is a line break, so it does not commit", () => {
    expect.hasAssertions();

    expect(getTextEditAction(pressKey({ key: "Enter", shiftKey: true }))).toBeUndefined();
  });
});
