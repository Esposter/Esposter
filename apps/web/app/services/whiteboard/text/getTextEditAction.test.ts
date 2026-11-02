// @vitest-environment happy-dom
import { WhiteboardTextEditAction } from "@/models/whiteboard/WhiteboardTextEditAction";
import { pressKey } from "@/services/whiteboard/constants.test";
import { getTextEditAction } from "@/services/whiteboard/text/getTextEditAction";
import { describe, expect, test } from "vitest";

describe(getTextEditAction, () => {
  test("enter commits the text edit and Escape discards it", () => {
    expect.hasAssertions();

    expect(getTextEditAction(pressKey({ key: "Enter" }))).toBe(WhiteboardTextEditAction.Commit);
    expect(getTextEditAction(pressKey({ key: "Escape" }))).toBe(WhiteboardTextEditAction.Discard);
  });

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
