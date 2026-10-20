// @vitest-environment happy-dom
import { TEST_ID } from "#shared/services/pageBuilder/constants.test";
import { getNodeIdFromElement } from "@/services/pageBuilder/getNodeIdFromElement";
import { runInNewContext } from "node:vm";
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

  test("a click inside a node of another realm selects that node", () => {
    expect.hasAssertions();

    // An element built in another JavaScript realm, as the PiP window's is: its prototypes are not this window's, so instanceof fails
    const foreignElement: EventTarget = runInNewContext(
      "({ tagName: 'SPAN', closest: () => ({ dataset: { nodeId } }) })",
      { nodeId: TEST_ID },
    );

    expect(getNodeIdFromElement(foreignElement)).toBe(TEST_ID);
  });

  test("a click outside any node selects nothing", () => {
    expect.hasAssertions();

    expect(getNodeIdFromElement(document.createElement("div"))).toBeUndefined();
  });
});
