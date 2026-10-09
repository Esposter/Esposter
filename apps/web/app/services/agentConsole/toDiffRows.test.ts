import { DiffRowType } from "@/models/agentConsole/DiffRowType";
import { DIFF_CONTEXT_LINE_COUNT } from "@/services/agentConsole/constants";
import { toDiffRows } from "@/services/agentConsole/toDiffRows";
import { describe, expect, test } from "vitest";

describe(toDiffRows, () => {
  test("pairs a replaced line beside its replacement and keeps what is unchanged", () => {
    expect.hasAssertions();

    expect(toDiffRows("a\nb", "a\nc\nd")).toStrictEqual([
      { newLine: "a", newLineNumber: 1, oldLine: "a", oldLineNumber: 1, type: DiffRowType.Unchanged },
      { newLine: "c", newLineNumber: 2, oldLine: "b", oldLineNumber: 2, type: DiffRowType.Changed },
      { newLine: "d", newLineNumber: 3, oldLine: "", oldLineNumber: 0, type: DiffRowType.Added },
    ]);
  });

  test("shows a created file as every line added and a removed run as removed", () => {
    expect.hasAssertions();

    expect(toDiffRows("", "a")).toStrictEqual([
      { newLine: "a", newLineNumber: 1, oldLine: "", oldLineNumber: 0, type: DiffRowType.Added },
    ]);
    expect(toDiffRows("a\nb", "a")).toStrictEqual([
      { newLine: "a", newLineNumber: 1, oldLine: "a", oldLineNumber: 1, type: DiffRowType.Unchanged },
      { newLine: "", newLineNumber: 0, oldLine: "b", oldLineNumber: 2, type: DiffRowType.Removed },
    ]);
  });

  test("folds an unchanged run far from any change into its count and keeps the lines after it numbered", () => {
    expect.hasAssertions();

    const unchangedLines = Array.from({ length: DIFF_CONTEXT_LINE_COUNT + 2 }, () => "a");
    const collapsedLabel = "⋯ 2 unchanged lines";

    expect(toDiffRows([...unchangedLines, "b"].join("\n"), [...unchangedLines, "c"].join("\n"))).toStrictEqual([
      {
        newLine: collapsedLabel,
        newLineNumber: 0,
        oldLine: collapsedLabel,
        oldLineNumber: 0,
        type: DiffRowType.Collapsed,
      },
      ...Array.from({ length: DIFF_CONTEXT_LINE_COUNT }, (_value, index) => ({
        newLine: "a",
        newLineNumber: index + 3,
        oldLine: "a",
        oldLineNumber: index + 3,
        type: DiffRowType.Unchanged,
      })),
      {
        newLine: "c",
        newLineNumber: DIFF_CONTEXT_LINE_COUNT + 3,
        oldLine: "b",
        oldLineNumber: DIFF_CONTEXT_LINE_COUNT + 3,
        type: DiffRowType.Changed,
      },
    ]);
  });
});
