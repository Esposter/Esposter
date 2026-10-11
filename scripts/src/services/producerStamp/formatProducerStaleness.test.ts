import type { ProducerStamp } from "#src/models/producerStamp/ProducerStamp";

import { PRODUCER_STALE_WINDOW_DAYS } from "#src/services/producerStamp/constants";
import { formatProducerStaleness } from "#src/services/producerStamp/formatProducerStaleness";
import { describe, expect, test } from "vitest";

describe(formatProducerStaleness, () => {
  const label = "a";
  const commit = "1234567".padEnd(40, "0");
  const stamp: ProducerStamp = { commit, isDirty: false, producerPaths: [] };
  const commitLine = "1 a";

  test("names an output with no stamp as predating its producer's record", () => {
    expect.hasAssertions();

    expect(formatProducerStaleness(label, { commits: [], isApproximate: false })).toBe(
      "a: written before outputs recorded their producer, so whether its extractor changed since is unknown",
    );
  });

  test("is empty for a clean stamp with no commits since", () => {
    expect.hasAssertions();

    expect(formatProducerStaleness(label, { commits: [], isApproximate: false, stamp })).toBe("");
  });

  test("names an output written from uncommitted changes even with no commits since", () => {
    expect.hasAssertions();

    expect(
      formatProducerStaleness(label, { commits: [], isApproximate: false, stamp: { ...stamp, isDirty: true } }),
    ).toBe("a: written at 1234567, from uncommitted changes; 0 commits to its producer since");
  });

  test("lists each commit since the stamp, indented", () => {
    expect.hasAssertions();

    expect(formatProducerStaleness(label, { commits: [commitLine], isApproximate: false, stamp })).toBe(
      ["a: written at 1234567; 1 commits to its producer since", `  ${commitLine}`].join("\n"),
    );
  });

  test("names the recent window when the stamp's commit is not on the branch", () => {
    expect.hasAssertions();

    expect(formatProducerStaleness(label, { commits: [commitLine], isApproximate: true, stamp })).toBe(
      `a: written at 1234567; 1 commits to its producer in the last ${PRODUCER_STALE_WINDOW_DAYS} days, since that commit is not on this branch\n  1 a`,
    );
  });

  test("names the recent window for a clean stamp whose commit is not on the branch, even with no commits in it", () => {
    expect.hasAssertions();

    expect(formatProducerStaleness(label, { commits: [], isApproximate: true, stamp })).toBe(
      `a: written at 1234567; 0 commits to its producer in the last ${PRODUCER_STALE_WINDOW_DAYS} days, since that commit is not on this branch`,
    );
  });

  test("counts the commits past the listed five", () => {
    expect.hasAssertions();

    const commits = Array.from({ length: 6 }, (_value, index) => `${index} a`);

    expect(formatProducerStaleness(label, { commits, isApproximate: false, stamp })).toBe(
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
