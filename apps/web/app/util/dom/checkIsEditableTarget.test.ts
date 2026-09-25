// @vitest-environment happy-dom
import { checkIsEditableTarget } from "@/util/dom/checkIsEditableTarget";
import { describe, expect, onTestFinished, test } from "vitest";

describe(checkIsEditableTarget, () => {
  test("true for input, select, and textarea", () => {
    expect.hasAssertions();

    expect(checkIsEditableTarget(document.createElement("input"))).toBe(true);
    expect(checkIsEditableTarget(document.createElement("select"))).toBe(true);
    expect(checkIsEditableTarget(document.createElement("textarea"))).toBe(true);
  });

  test("true for contenteditable element", () => {
    expect.hasAssertions();

    const div = document.createElement("div");
    div.contentEditable = "true";
    // `happy-dom` only reflects isContentEditable once the element is attached
    document.body.append(div);
    onTestFinished(() => {
      div.remove();
    });

    expect(checkIsEditableTarget(div)).toBe(true);
  });

  test("false for non-editable element and null", () => {
    expect.hasAssertions();

    expect(checkIsEditableTarget(document.createElement("div"))).toBe(false);
    expect(checkIsEditableTarget(null)).toBe(false);
  });
});
