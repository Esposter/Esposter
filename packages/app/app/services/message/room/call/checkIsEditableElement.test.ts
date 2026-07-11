// @vitest-environment nuxt

import { checkIsEditableElement } from "@/services/message/room/call/checkIsEditableElement";
import { describe, expect, test } from "vitest";

describe(checkIsEditableElement, () => {
  test("null target is not editable", () => {
    expect.hasAssertions();

    expect(checkIsEditableElement(null)).toBe(false);
  });

  test("non-element event target is not editable", () => {
    expect.hasAssertions();

    expect(checkIsEditableElement(new EventTarget())).toBe(false);
  });

  test("input, textarea and select are editable", () => {
    expect.hasAssertions();

    for (const tagName of ["input", "textarea", "select"])
      expect(checkIsEditableElement(window.document.createElement(tagName))).toBe(true);
  });

  test("contenteditable element is editable", () => {
    expect.hasAssertions();

    const element = window.document.createElement("div");
    element.contentEditable = "true";

    expect(checkIsEditableElement(element)).toBe(true);
  });

  test("plain element is not editable", () => {
    expect.hasAssertions();

    expect(checkIsEditableElement(window.document.createElement("div"))).toBe(false);
  });
});
