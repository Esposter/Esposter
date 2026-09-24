// @vitest-environment happy-dom
import { FLOW_MAP_PATH } from "@@/scripts/flowMap/constants";
import { getFlowMap } from "@@/scripts/flowMap/services/getFlowMap";
import mermaid from "mermaid";
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

describe(getFlowMap, () => {
  const flowMap = getFlowMap();

  test("the committed map is the one the source draws", () => {
    expect.hasAssertions();

    expect(flowMap, "run `pnpm flow-map:gen` from apps/web").toBe(readFileSync(FLOW_MAP_PATH, "utf8"));
  });

  test("parses", async () => {
    expect.hasAssertions();

    await expect(mermaid.parse(flowMap)).resolves.toBeDefined();
  });
});
