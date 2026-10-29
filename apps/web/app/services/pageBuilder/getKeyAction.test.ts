// @vitest-environment happy-dom
import { TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { KeyAction } from "@/models/pageBuilder/KeyAction";
import { KeyScope } from "@/models/pageBuilder/KeyScope";
import { getKeyAction } from "@/services/pageBuilder/getKeyAction";
import { describe, expect, test } from "vitest";

// The event is dispatched on its target, so the target it reports is the element the key was pressed in
const press = (init: KeyboardEventInit, target: EventTarget = document.body) => {
  const event = new KeyboardEvent("keydown", init);
  target.dispatchEvent(event);
  return event;
};

describe(getKeyAction, () => {
  test("the canvas takes arrow down, arrow up and escape as the next node, the previous node and the parent", () => {
    expect.hasAssertions();

    expect(getKeyAction(press({ key: "ArrowDown" }), KeyScope.Canvas)).toBe(KeyAction.NextNode);
    expect(getKeyAction(press({ key: "ArrowUp" }), KeyScope.Canvas)).toBe(KeyAction.PreviousNode);
    expect(getKeyAction(press({ key: "Escape" }), KeyScope.Canvas)).toBe(KeyAction.ParentNode);
  });

  test("the canvas takes no arrow or escape held with a modifier, so the editor keeps the chord", () => {
    expect.hasAssertions();

    expect(getKeyAction(press({ altKey: true, key: "ArrowDown" }), KeyScope.Canvas)).toBeUndefined();
    expect(getKeyAction(press({ ctrlKey: true, key: "ArrowUp" }), KeyScope.Canvas)).toBeUndefined();
    expect(getKeyAction(press({ key: "Escape", metaKey: true }), KeyScope.Canvas)).toBeUndefined();
  });

  test("a plain arrow is the canvas's, and the editor takes no key the canvas takes without a modifier", () => {
    expect.hasAssertions();

    expect(getKeyAction(press({ key: "ArrowDown" }), KeyScope.Editor)).toBeUndefined();
    expect(getKeyAction(press({ key: "Escape" }), KeyScope.Editor)).toBeUndefined();
  });

  test("alt with an arrow moves the node that way", () => {
    expect.hasAssertions();

    expect(getKeyAction(press({ altKey: true, key: "ArrowDown" }), KeyScope.Editor)).toBe(KeyAction.MoveDown);
    expect(getKeyAction(press({ altKey: true, key: "ArrowLeft" }), KeyScope.Editor)).toBe(KeyAction.MoveLeft);
    expect(getKeyAction(press({ altKey: true, key: "ArrowRight" }), KeyScope.Editor)).toBe(KeyAction.MoveRight);
    expect(getKeyAction(press({ altKey: true, key: "ArrowUp" }), KeyScope.Editor)).toBe(KeyAction.MoveUp);
  });

  test("ctrl or cmd with c, x or v is the clipboard, whichever the case of the letter", () => {
    expect.hasAssertions();

    expect(getKeyAction(press({ ctrlKey: true, key: "c" }), KeyScope.Editor)).toBe(KeyAction.Copy);
    expect(getKeyAction(press({ key: "X", metaKey: true, shiftKey: true }), KeyScope.Editor)).toBe(KeyAction.Cut);
    expect(getKeyAction(press({ ctrlKey: true, key: "V" }), KeyScope.Editor)).toBe(KeyAction.Paste);
  });

  test("enter starts a text edit, unless a button or a link holds focus", () => {
    expect.hasAssertions();

    const button = document.createElement("button");
    const link = document.createElement("a");
    link.href = TEST_URL;
    document.body.append(button, link);

    expect(getKeyAction(press({ key: "Enter" }), KeyScope.Editor)).toBe(KeyAction.StartTextEdit);
    expect(getKeyAction(press({ key: "Enter" }, button), KeyScope.Editor)).toBeUndefined();
    expect(getKeyAction(press({ key: "Enter" }, link), KeyScope.Editor)).toBeUndefined();
  });

  test("delete and backspace delete the selected node, but not with alt held", () => {
    expect.hasAssertions();

    expect(getKeyAction(press({ key: "Delete" }), KeyScope.Editor)).toBe(KeyAction.Delete);
    expect(getKeyAction(press({ key: "Backspace" }), KeyScope.Editor)).toBe(KeyAction.Delete);
    expect(getKeyAction(press({ altKey: true, key: "Delete" }), KeyScope.Editor)).toBeUndefined();
  });

  test("a key typed into a text field is taken by neither handler", () => {
    expect.hasAssertions();

    const input = document.createElement("input");
    document.body.append(input);

    expect(getKeyAction(press({ altKey: true, key: "ArrowDown" }, input), KeyScope.Editor)).toBeUndefined();
    expect(getKeyAction(press({ key: "Delete" }, input), KeyScope.Editor)).toBeUndefined();
    expect(getKeyAction(press({ key: "ArrowDown" }, input), KeyScope.Canvas)).toBeUndefined();
  });
});
