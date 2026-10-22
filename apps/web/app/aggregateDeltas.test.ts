import { glob, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// A count the server derives from many rows is re-read, never moved by a delta. A delta is exact only while the client
// Holds the state it changes against, and a change that arrives out of order, or a read that already counted it, drifts
// The count with nothing to correct it. The rule and its owners are client-data's "Server-owned aggregates are re-read,
// Never adjusted". Only the fields named here are checked, so an ordinary counter in a loop is left alone
const AGGREGATE_FIELDS = ["commentCount", "count", "likeCount", "memberCount"];
const AGGREGATE_FIELD = `(?:${AGGREGATE_FIELDS.join("|")})`;
const DELTA = String.raw`(?:\+\+|--|[+-]=)`;
// A reassignment that reads the count back and moves it is a delta too: `likeCount = likeCount + value`
const DELTA_ON_AGGREGATE_REGEX = new RegExp(
  String.raw`\.${AGGREGATE_FIELD}\s*${DELTA}|${DELTA}[\w$.()[\]]*\.${AGGREGATE_FIELD}\b|\.${AGGREGATE_FIELD}\s*=\s*[^;]*\.${AGGREGATE_FIELD}\s*[+-]`,
  "u",
);

describe("aggregateDeltas", () => {
  const ROOT = join(import.meta.dirname, "..");

  test("matches a delta on a server-derived count and nothing else", () => {
    expect.hasAssertions();

    expect(DELTA_ON_AGGREGATE_REGEX.test("x.count += 0;")).toBe(true);
    expect(DELTA_ON_AGGREGATE_REGEX.test("x.count++;")).toBe(true);
    expect(DELTA_ON_AGGREGATE_REGEX.test("--x.count;")).toBe(true);
    expect(DELTA_ON_AGGREGATE_REGEX.test("x.count = x.count + 0;")).toBe(true);
    expect(DELTA_ON_AGGREGATE_REGEX.test("x.total += 0;")).toBe(false);
    expect(DELTA_ON_AGGREGATE_REGEX.test("x++;")).toBe(false);
    expect(DELTA_ON_AGGREGATE_REGEX.test("x.count = count;")).toBe(false);
  });

  test("moves no server-derived count by a delta in client code", async () => {
    expect.hasAssertions();

    const sourcePaths = (await Array.fromAsync(glob(["app/**/*.{ts,vue}"], { cwd: ROOT })))
      .map((sourcePath) => sourcePath.replaceAll("\\", "/"))
      .filter((sourcePath) => !/\.(?:bench|test|test-d)\.ts$/u.test(sourcePath));
    const violations: string[] = [];
    for (const sourcePath of sourcePaths) {
      const lines = (await readFile(join(ROOT, sourcePath), "utf8")).split("\n");
      for (const [lineIndex, line] of lines.entries())
        if (DELTA_ON_AGGREGATE_REGEX.test(line)) violations.push(`${sourcePath}:${lineIndex + 1}`);
    }

    expect(violations).toStrictEqual([]);
  });
});
