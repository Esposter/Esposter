import type { LayerScore } from "#src/models/genshinParity/reference/LayerScore";
import type { ParityScore } from "#src/models/genshinParity/reference/ParityScore";

import { mergeParityScores } from "#src/services/genshinParity/reference/mergeParityScores";
import { describe, expect, test } from "vitest";

// Every row's key, the first cell of either table, in the order the report holds them
const readKeys = (report: string): string[] =>
  report.split("\n").flatMap((line) => /^\| `(?<key>[^`]+)` \|/u.exec(line)?.groups?.key ?? []);
const createLayer = (name: string): LayerScore => ({
  colour: 0,
  coverage: 0,
  detail: 0,
  flip: 0,
  name,
  shape: 0,
  tone: 0,
});
const createScore = (layers: LayerScore[]): ParityScore => ({
  edgeScore: 0,
  flip: 0,
  layers,
  meanDifference: 0,
  screen: "",
  toneDifference: 0,
});

describe(mergeParityScores, () => {
  test("rewrites a scored reference's layers whole and keeps every other reference's rows in the references' order", () => {
    expect.hasAssertions();

    const lines = mergeParityScores(
      [],
      { a: createScore([createLayer("frame"), createLayer("walkway")]), b: createScore([createLayer("frame")]) },
      ["a", "b"],
    ).split("\n");

    expect(readKeys(mergeParityScores(lines, { a: createScore([createLayer("frame")]) }, ["b", "a"]))).toStrictEqual([
      "b",
      "a",
      "b/frame",
      "a/frame",
    ]);
  });

  test("replaces a key's row in place, adds a new key, and collapses a key the lines hold twice into one row", () => {
    expect.hasAssertions();

    const report = mergeParityScores(
      [
        "| `a` | `S` | 1.00% | 0.000 | 0.00% | 0.0000 |",
        "| `b` | `S` | 1.00% | 0.000 | 0.00% | 0.0000 |",
        "| `a` | `S` | 2.00% | 0.000 | 0.00% | 0.0000 |",
      ],
      { b: { ...createScore([]), meanDifference: 3, screen: "S" }, c: { ...createScore([]), screen: "S" } },
      ["a", "b", "c"],
    );

    expect(readKeys(report)).toStrictEqual(["a", "b", "c"]);
    expect(report).toContain("| `a` | `S` | 2.00% |");
    expect(report).toContain("| `b` | `S` | 3.00% |");
  });

  test("writes no layers table where no reference has layers", () => {
    expect.hasAssertions();

    expect(mergeParityScores([], { a: createScore([]) }, ["a"])).not.toContain("## Layers");
  });
});
