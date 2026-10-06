import { parseVersionTag } from "#src/services/outdatedDependencies/tag/parseVersionTag";
import { describe, expect, test } from "vitest";

describe(parseVersionTag, () => {
  test("splits a tag into its prefix, release and suffix", () => {
    expect.hasAssertions();

    expect(parseVersionTag("v0.1.2-a")).toStrictEqual({ prefix: "v", release: [0, 1, 2], suffix: "-a" });
  });

  test("returns undefined for a tag naming no version", () => {
    expect.hasAssertions();

    expect(parseVersionTag("a-slim")).toBeUndefined();
  });
});
