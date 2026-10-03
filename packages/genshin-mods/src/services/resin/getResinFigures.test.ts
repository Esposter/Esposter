import { describe, expect, test } from "vitest";

import { CACHE_LIFETIME_MS } from "../constants";
import { getResinFigures } from "./getResinFigures";

describe(getResinFigures, () => {
  const context = { percent: 90, tokens: 900_000, window: 1_000_000 };

  test("reads every figure the engine has, warning past each threshold", () => {
    expect.hasAssertions();

    const figures = getResinFigures(
      { context, cost: { usd: 1 }, rateLimits: [{ kind: "five_hour", percentUsed: 1 }] },
      1,
      CACHE_LIFETIME_MS,
    );

    expect(figures).toStrictEqual([
      { isWarning: true, label: "cache", text: "1m · re-sends 900K" },
      { isWarning: true, label: "context", text: "900K/1M" },
      { isWarning: false, label: "5h", text: "1%" },
      { isWarning: false, label: "cost", text: "$1.00" },
    ]);
  });

  test("leaves out what the engine has not measured", () => {
    expect.hasAssertions();

    expect(getResinFigures({ context: { window: 1 }, rateLimits: [] }, 0, 0)).toStrictEqual([]);
  });

  test("reads a cache past its lifetime as cold", () => {
    expect.hasAssertions();

    expect(getResinFigures({ context: { window: 1 }, rateLimits: [] }, 1, CACHE_LIFETIME_MS + 1)).toStrictEqual([
      { isWarning: true, label: "cache", text: "cold" },
    ]);
  });
});
