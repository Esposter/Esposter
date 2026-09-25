import { toCssTimeMs } from "@/services/agentConsole/world/toCssTimeMs";
import { describe, expect, test } from "vitest";

describe(toCssTimeMs, () => {
  test.each([
    ["1ms", 1],
    ["1s", 1000],
    ["", 0],
    ["a", 0],
  ])("reads %j as %d milliseconds", (cssTime, cssTimeMs) => {
    expect.hasAssertions();

    expect(toCssTimeMs(cssTime)).toBe(cssTimeMs);
  });
});
