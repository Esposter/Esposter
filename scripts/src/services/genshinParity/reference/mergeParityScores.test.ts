import type { LayerScore } from "#src/models/genshinParity/reference/LayerScore";
import type { ParityScore } from "#src/models/genshinParity/reference/ParityScore";

import { ParityReportRun } from "#src/models/genshinParity/reference/ParityReportRun";
import { PARITY_SCORES_FORMAT_PATH } from "#src/services/genshinParity/reference/constants";
import { mergeParityScores } from "#src/services/genshinParity/reference/mergeParityScores";
import { formatText } from "#src/services/shared/formatText";
import { describe, expect, test } from "vitest";

// Every row's key, the first cell of either table, in the order the report holds them
const readKeys = (report: string): string[] =>
  report.split("\n").flatMap((line) => /^\|\s*`(?<key>[^`]+)`\s*\|/u.exec(line)?.groups?.key ?? []);
// Every row's cells, trimmed, so the formatter's padding is not part of what a row holds
const readRowCells = (report: string): string[][] =>
  report.split("\n").flatMap((line) =>
    /^\|\s*`/u.test(line)
      ? [
          line
            .split("|")
            .slice(1, -1)
            .map((cell) => cell.trim()),
        ]
      : [],
  );
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
  // The committed report's header, three reference rows, a scene among them, and its layers, as the writer writes them
  // unpadded: the formatter pads them into the committed file's own table, so the tests read the report as it is committed
  const REPORT_LINES = [
    "# Parity scores",
    "",
    "Every reference's last `pnpm -C scripts genshin:parity compare`, which rewrites its own row (`--all` rewrites them",
    "all). The mean difference, the tone and FLIP's perceptual error run from 0 (identical) up; the shape is the share of",
    "the reference's edges the shot shares, 1 identical. Commit it with the change that moved it, as a bench's report is",
    "committed.",
    "",
    "| Reference | Screen | Mean difference | Shape | Tone | FLIP |",
    "| :-- | :-- | --: | --: | --: | --: |",
    "| `archive-screen` | `ArchiveScreen` | 10.91% | 0.875 | 2.38% | 0.3637 |",
    "| `character-artifacts` | `CharacterScreen` | 2.88% | 0.924 | 0.91% | 0.1226 |",
    "| `character-artifacts-tabs` | `CharacterScreen` | 0.88% | 0.976 | 0.32% | 0.0474 |",
    "| `court-of-fontaine-location` | `WorldScreen` | 31.74% | 0.202 | 27.65% | 0.8417 |",
    "",
    "## Layers",
    "",
    "Each scene's shot scored again over each family of its parts, as the witness's part target lays them at the",
    "reference's view, and over the sky, within the region its row above scores, so its frame is that row: its share of",
    "the region, the CIELab distance between its mean colour and the reference's, and its tone and FLIP, so a family",
    "drawn away from the reference shows on its own row.",
    "",
    "| Layer | Coverage | Colour | Tone | FLIP |",
    "| :-- | --: | --: | --: | --: |",
    "| `court-of-fontaine-location/frame` | 100.0% | 24.06 | 27.65% | 0.8417 |",
  ];
  const REPORT_IDS = [
    "archive-screen",
    "character-artifacts",
    "character-artifacts-tabs",
    "court-of-fontaine-location",
  ];
  const ARTIFACTS_ROW = "| `character-artifacts` | `CharacterScreen` | 2.88% | 0.924 | 0.91% | 0.1226 |";
  const ARTIFACTS_SCORED_ROW = "| `character-artifacts` | `CharacterScreen` | 3.00% | 0.924 | 0.91% | 0.1226 |";
  const formatReport = (lines: readonly string[]): string =>
    formatText(PARITY_SCORES_FORMAT_PATH, `${lines.join("\n")}\n`);
  const committedReport = formatReport(REPORT_LINES);

  test("a subset run rewrites only the scored row of the committed report, and writes the formatter's own text", () => {
    expect.hasAssertions();

    const report = mergeParityScores(
      committedReport.split("\n"),
      {
        "character-artifacts": {
          ...createScore([]),
          edgeScore: 0.924,
          flip: 0.1226,
          meanDifference: 3,
          screen: "CharacterScreen",
          toneDifference: 0.91,
        },
      },
      REPORT_IDS,
      {},
      ParityReportRun.Subset,
    );

    expect(report).toBe(
      formatReport(REPORT_LINES.map((line) => (line === ARTIFACTS_ROW ? ARTIFACTS_SCORED_ROW : line))),
    );
    expect(formatText(PARITY_SCORES_FORMAT_PATH, report)).toBe(report);
  });

  test("a subset run reads an unpadded row of the committed report as it reads a padded one", () => {
    expect.hasAssertions();

    const mixed = committedReport
      .split("\n")
      .map((line) =>
        line.startsWith("| `archive-screen`")
          ? "| `archive-screen` | `ArchiveScreen` | 10.91% | 0.875 | 2.38% | 0.3637 |"
          : line,
      );

    expect(mergeParityScores(mixed, {}, REPORT_IDS, {}, ParityReportRun.Subset)).toBe(committedReport);
  });

  test("a full run over the committed report, with nothing scored, reproduces it", () => {
    expect.hasAssertions();

    expect(mergeParityScores(committedReport.split("\n"), {}, REPORT_IDS, {}, ParityReportRun.Full)).toBe(
      committedReport,
    );
  });

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

  test("a subset run leaves every other row's cells as the report held them", () => {
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

    expect(readRowCells(report)).toStrictEqual([
      ["`a`", "`S`", "3.00%", "0.000", "0.00%", "0.0000"],
      ["`b`", "`S`", "2.00%", "0.000", "0.00%", "0.0000"],
      ["`b/frame`", "50.0%", "1.00", "0.00%", "0.0000"],
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

    expect(readRowCells(report)).toStrictEqual([
      ["`a`", "`S`", "2.00%", "0.000", "0.00%", "0.0000"],
      ["`b`", "`S`", "3.00%", "0.000", "0.00%", "0.0000"],
      ["`c`", "`S`", "0.00%", "0.000", "0.00%", "0.0000"],
    ]);
  });

  test("writes no layers table where no reference has layers", () => {
    expect.hasAssertions();

    expect(mergeParityScores([], { a: createScore([]) }, ["a"], {}, ParityReportRun.Subset)).not.toContain("## Layers");
  });

  test("a full run lists a pending reference in its place with its reason, over the row it held when it was scored", () => {
    expect.hasAssertions();

    const report = mergeParityScores(
      ["| `a` | `S` | 1.00% | 0.000 | 0.00% | 0.0000 |"],
      {},
      ["a"],
      { a: { pending: "no recording yet", screen: "S" } },
      ParityReportRun.Full,
    );

    expect(readRowCells(report)).toStrictEqual([["`a`", "`S`", "pending: no recording yet", "", "", ""]]);
  });

  test("a subset run adds no pending row the report does not hold, and leaves the one it holds as it was", () => {
    expect.hasAssertions();

    const report = mergeParityScores(
      ["| `a` | `S` | 1.00% | 0.000 | 0.00% | 0.0000 |", "| `p` | `S` | pending: old reason | | | |"],
      { a: { ...createScore([]), screen: "S" } },
      ["a", "p", "q"],
      { p: { pending: "new reason", screen: "S" }, q: { pending: "no recording yet", screen: "S" } },
      ParityReportRun.Subset,
    );

    expect(readRowCells(report)).toStrictEqual([
      ["`a`", "`S`", "0.00%", "0.000", "0.00%", "0.0000"],
      ["`p`", "`S`", "pending: old reason", "", "", ""],
    ]);
  });
});
