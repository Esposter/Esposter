import { FLOW_MAP_PATH } from "@@/scripts/flowMap/constants";
import { getFlowMap } from "@@/scripts/flowMap/services/getFlowMap";
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

describe(getFlowMap, () => {
  test("the committed map is the one the source draws", () => {
    expect.hasAssertions();

    expect(getFlowMap(), "run `pnpm flow-map:gen` from apps/web").toBe(readFileSync(FLOW_MAP_PATH, "utf8"));
  });
});
