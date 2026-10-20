// @vitest-environment happy-dom
import { TEST_ID } from "#shared/services/pageBuilder/constants.test";
import { getNodeIdFromElement } from "@/services/pageBuilder/getNodeIdFromElement";
import { describe, expect, test } from "vitest";

describe(getNodeIdFromElement, () => {
  test("a click inside a node selects that node", () => {
    expect.hasAssertions();

    const node = document.createElement("div");
    node.dataset.nodeId = TEST_ID;
    const inner = document.createElement("span");
    node.append(inner);

    expect(getNodeIdFromElement(inner)).toBe(TEST_ID);
  });

  test("a click inside a node of another document selects that node", () => {
    expect.hasAssertions();

    const otherDocument = document.implementation.createHTMLDocument("");
    const node = otherDocument.createElement("div");
    node.dataset.nodeId = TEST_ID;
    const inner = otherDocument.createElement("span");
    node.append(inner);

    expect(getNodeIdFromElement(inner)).toBe(TEST_ID);
  });

  test("a click outside any node selects nothing", () => {
    expect.hasAssertions();

    expect(getNodeIdFromElement(document.createElement("div"))).toBeUndefined();
  });
});
