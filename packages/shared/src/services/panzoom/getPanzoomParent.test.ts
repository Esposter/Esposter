// @vitest-environment happy-dom
import { getPanzoomParent } from "#src/services/panzoom/getPanzoomParent";
import { describe, expect, test } from "vitest";

describe(getPanzoomParent, () => {
  test("a child of an element resolves to that element", () => {
    expect.hasAssertions();

    const parent = document.createElement("div");
    const element = document.createElement("div");
    parent.append(element);

    expect(getPanzoomParent(element)).toBe(parent);
  });

  test("#646 a direct child of a shadow root resolves to the root's host", () => {
    expect.hasAssertions();

    const host = document.createElement("div");
    const shadowRoot = host.attachShadow({ mode: "open" });
    const element = document.createElement("div");
    shadowRoot.append(element);

    expect(getPanzoomParent(element)).toBe(host);
  });

  test("an element with no parent resolves to none", () => {
    expect.hasAssertions();

    expect(getPanzoomParent(document.createElement("div"))).toBeNull();
  });
});
