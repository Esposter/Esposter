// @vitest-environment happy-dom
import { checkIsHorizontalFlow } from "@/services/pageBuilder/checkIsHorizontalFlow";
import { describe, expect, test } from "vitest";

const createElement = (style: Partial<CSSStyleDeclaration>): HTMLElement => {
  const element = document.createElement("div");
  Object.assign(element.style, style);
  document.body.append(element);
  return element;
};

describe(checkIsHorizontalFlow, () => {
  test("a flex container laid out in a row is horizontal", () => {
    expect.hasAssertions();

    expect(checkIsHorizontalFlow(createElement({ display: "flex", flexDirection: "row" }))).toBe(true);
  });

  test("an inline flex container laid out in a row is horizontal", () => {
    expect.hasAssertions();

    expect(checkIsHorizontalFlow(createElement({ display: "inline-flex", flexDirection: "row" }))).toBe(true);
  });

  test("a flex column and a block are not horizontal", () => {
    expect.hasAssertions();

    expect(checkIsHorizontalFlow(createElement({ display: "flex", flexDirection: "column" }))).toBe(false);
    expect(checkIsHorizontalFlow(createElement({ display: "block" }))).toBe(false);
  });
});
