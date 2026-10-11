import type { ProducerStamp } from "#src/models/producerStamp/ProducerStamp";

import { formatProducerStaleness } from "#src/services/producerStamp/formatProducerStaleness";
import { describe, expect, test } from "vitest";

describe(formatProducerStaleness, () => {
  const label = "a";
  const commit = "1234567".padEnd(40, "0");
  const stamp: ProducerStamp = { commit, isDirty: false, producerPaths: [] };
  const commitLine = "1 a";

  test("names an output with no stamp as predating its producer's record", () => {
    expect.hasAssertions();

    expect(formatProducerStaleness(label, { commits: [] })).toBe(
      "a: written before outputs recorded their producer, so whether its extractor changed since is unknown",
    );
  });

  test("is empty for a clean stamp with no commits since", () => {
    expect.hasAssertions();

    expect(formatProducerStaleness(label, { commits: [], stamp })).toBe("");
  });

  test("names an output written from uncommitted changes even with no commits since", () => {
    expect.hasAssertions();

    expect(formatProducerStaleness(label, { commits: [], stamp: { ...stamp, isDirty: true } })).toBe(
      "a: written at 1234567, from uncommitted changes; 0 commits to its producer since",
    );
  });

  test("lists each commit since the stamp, indented", () => {
    expect.hasAssertions();

    expect(formatProducerStaleness(label, { commits: [commitLine], stamp })).toBe(
      ["a: written at 1234567; 1 commits to its producer since", `  ${commitLine}`].join("\n"),
    );
  });

  test("counts the commits past the listed five", () => {
    expect.hasAssertions();

    const commits = Array.from({ length: 6 }, (_value, index) => `${index} a`);

    expect(formatProducerStaleness(label, { commits, stamp })).toBe(
      [
        "a: written at 1234567; 6 commits to its producer since",
        "  0 a",
        "  1 a",
        "  2 a",
        "  3 a",
        "  4 a",
        "  …and 1 more",
      ].join("\n"),
    );
  });
});
