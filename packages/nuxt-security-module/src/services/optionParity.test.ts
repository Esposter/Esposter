import { getDefaultModuleOptions } from "#src/services/getDefaultModuleOptions";
import { getDefaultSecurityHeaders } from "#src/services/getDefaultSecurityHeaders";
import { OPTION_PARITY } from "#src/services/optionParity";
import { UPSTREAM_MODULE_OPTIONS } from "#src/services/upstreamModuleOptions";
import { describe, expect, test } from "vitest";

describe("option parity", () => {
  test("names every upstream option exactly once, so a newer upstream option is a missing row", () => {
    expect.hasAssertions();

    expect(OPTION_PARITY.map(({ upstream }) => upstream).toSorted()).toStrictEqual(UPSTREAM_MODULE_OPTIONS.toSorted());
  });

  test("every ported row names one of our options, which the defaults carry", () => {
    expect.hasAssertions();

    const ourOptions = new Set([
      ...Object.keys(getDefaultModuleOptions(false, "", false)),
      ...Object.keys(getDefaultSecurityHeaders(false, false)).map((header) => `headers.${header}`),
    ]);
    for (const { ours, verdict } of OPTION_PARITY) {
      if (verdict === "dropped" || verdict === "outOfScope") continue;

      expect(ourOptions.has(ours ?? "")).toBe(true);
    }
  });
});
