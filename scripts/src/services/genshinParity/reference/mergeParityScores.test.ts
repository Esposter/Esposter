import type { LayerScore } from "#src/models/genshinParity/reference/LayerScore";
import type { ParityScore } from "#src/models/genshinParity/reference/ParityScore";

import { ParityReportRun } from "#src/models/genshinParity/reference/ParityReportRun";
import { mergeParityScores } from "#src/services/genshinParity/reference/mergeParityScores";
import { describe, expect, test } from "vitest";

// Every row's key, the first cell of either table, in the order the report holds them
const readKeys = (report: string): string[] =>
  report.split("\n").flatMap((line) => /^\| `(?<key>[^`]+)` \|/u.exec(line)?.groups?.key ?? []);
// Every row's line, of either table, exactly as the report holds it
const readRows = (report: string): string[] => report.split("\n").filter((line) => /^\| `/u.test(line));
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
  test("a subset run rewrites a scored reference's layers whole and keeps every other row in the report's own order", () => {
    expect.hasAssertions();

    const lines = mergeParityScores(
      [],
      { a: createScore([createLayer("frame"), createLayer("walkway")]), b: createScore([createLayer("frame")]) },
      ["a", "b"],
      {},
      ParityReportRun.Subset,
    ).split("\n");

    expect(
      readKeys(
        mergeParityScores(lines, { a: createScore([createLayer("frame")]) }, ["b", "a"], {}, ParityReportRun.Subset),
      ),
    ).toStrictEqual(["a", "b", "a/frame", "b/frame"]);
  });

  test("a subset run leaves every other row's line exactly as the report held it", () => {
    expect.hasAssertions();

    const report = mergeParityScores(
      [
        "| `a` | `S` | 1.00% | 0.000 | 0.00% | 0.0000 |",
        "| `b` |  `S`  | 2.00% | 0.000 | 0.00% | 0.0000 |",
        "| `b/frame` |  50.0% | 1.00 | 0.00% | 0.0000 |",
      ],
      { a: { ...createScore([]), meanDifference: 3, screen: "S" } },
      ["a", "b"],
      {},
      ParityReportRun.Subset,
    );

    expect(readRows(report)).toStrictEqual([
      "| `a` | `S` | 3.00% | 0.000 | 0.00% | 0.0000 |",
      "| `b` |  `S`  | 2.00% | 0.000 | 0.00% | 0.0000 |",
      "| `b/frame` |  50.0% | 1.00 | 0.00% | 0.0000 |",
    ]);
  });

  test("a subset run keeps a row for a fixture the map no longer holds where the report had it", () => {
    expect.hasAssertions();

    const report = mergeParityScores(
      ["| `a` | `S` | 1.00% | 0.000 | 0.00% | 0.0000 |", "| `gone` | `S` | 1.00% | 0.000 | 0.00% | 0.0000 |"],
      { a: { ...createScore([]), screen: "S" } },
      ["a"],
      {},
      ParityReportRun.Subset,
    );

    expect(readKeys(report)).toStrictEqual(["a", "gone"]);
  });

  test("a full run drops a row for a fixture the map no longer holds and lists the rest in the references' order", () => {
    expect.hasAssertions();

    const report = mergeParityScores(
      [
        "| `b` | `S` | 1.00% | 0.000 | 0.00% | 0.0000 |",
        "| `gone` | `S` | 1.00% | 0.000 | 0.00% | 0.0000 |",
        "| `a` | `S` | 1.00% | 0.000 | 0.00% | 0.0000 |",
      ],
      { b: { ...createScore([]), screen: "S" } },
      ["a", "b"],
      {},
      ParityReportRun.Full,
    );

    expect(readKeys(report)).toStrictEqual(["a", "b"]);
  });

  test("a subset run keeps the report's own row order, not the references' order", () => {
    expect.hasAssertions();

    const report = mergeParityScores(
      ["| `b` | `S` | 1.00% | 0.000 | 0.00% | 0.0000 |", "| `a` | `S` | 1.00% | 0.000 | 0.00% | 0.0000 |"],
      { a: { ...createScore([]), screen: "S" } },
      ["a", "b"],
      {},
      ParityReportRun.Subset,
    );

    expect(readKeys(report)).toStrictEqual(["b", "a"]);
  });

  test("a subset run places a new key in the references' order, between the rows it falls among", () => {
    expect.hasAssertions();

    const report = mergeParityScores(
      ["| `a` | `S` | 1.00% | 0.000 | 0.00% | 0.0000 |", "| `c` | `S` | 1.00% | 0.000 | 0.00% | 0.0000 |"],
      { b: { ...createScore([]), screen: "S" } },
      ["a", "b", "c"],
      {},
      ParityReportRun.Subset,
    );

    expect(readKeys(report)).toStrictEqual(["a", "b", "c"]);
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
      {},
      ParityReportRun.Subset,
    );

    expect(readKeys(report)).toStrictEqual(["a", "b", "c"]);
    expect(report).toContain("| `a` | `S` | 2.00% |");
    expect(report).toContain("| `b` | `S` | 3.00% |");
  });

  test("writes no layers table where no reference has layers", () => {
    expect.hasAssertions();

    expect(mergeParityScores([], { a: createScore([]) }, ["a"], {}, ParityReportRun.Subset)).not.toContain("## Layers");
  });

  test("lists a pending reference in its place with its reason, over the row it held when it was scored", () => {
    expect.hasAssertions();

    const report = mergeParityScores(
      ["| `a` | `S` | 1.00% | 0.000 | 0.00% | 0.0000 |"],
      {},
      ["a"],
      { a: { pending: "no recording yet", screen: "S" } },
      ParityReportRun.Subset,
    );

    expect(report).toContain("| `a` | `S` | pending: no recording yet | | | |");
    expect(report).not.toContain("1.00%");
  });
});
