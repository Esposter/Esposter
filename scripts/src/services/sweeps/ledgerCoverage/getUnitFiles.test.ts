import { getUnitFiles } from "#src/services/sweeps/ledgerCoverage/getUnitFiles";
import { describe, expect, test } from "vitest";

describe(getUnitFiles, () => {
  // Each form of the unit grammar once, over one tree and one partition, so a rest is shown beside the units it omits
  const cases = [
    ["a file", "`a/x.ts`", ["a/x.ts"]],
    ["a directory's whole tree", "`a/b`", ["a/b/y.ts"]],
    ["the entries of a directory", "`a` — `c.ts`, `z.ts`", ["a/c.ts", "a/z.ts"]],
    ["a list of paths", "`d`, `e/f.ts`", ["d/q.ts", "e/f.ts"]],
    ["the rest of a directory", "`e` — the rest", ["e/g/h.ts"]],
  ] as const;
  const units = cases.map(([, unit]) => unit);
  const tracked = ["a/x.ts", "a/c.ts", "a/z.ts", "a/b/y.ts", "d/q.ts", "e/f.ts", "e/g/h.ts"];

  test.each(cases)("resolves %s to its tracked files", (_description, unit, files) => {
    expect.hasAssertions();

    expect(getUnitFiles(units, tracked).get(unit)).toStrictEqual(files);
  });
});
