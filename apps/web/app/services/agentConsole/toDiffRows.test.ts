import { DiffRowType } from "@/models/agentConsole/DiffRowType";
import { toDiffRows } from "@/services/agentConsole/toDiffRows";
import { describe, expect, test } from "vitest";

describe(toDiffRows, () => {
  test("pairs a replaced line beside its replacement and keeps what is unchanged", () => {
    expect.hasAssertions();

    expect(toDiffRows("a\nb", "a\nc\nd")).toStrictEqual([
      { newLine: "a", oldLine: "a", type: DiffRowType.Unchanged },
      { newLine: "c", oldLine: "b", type: DiffRowType.Changed },
      { newLine: "d", oldLine: "", type: DiffRowType.Added },
    ]);
  });

  test("shows a created file as every line added and a removed run as removed", () => {
    expect.hasAssertions();

    expect(toDiffRows("", "a")).toStrictEqual([{ newLine: "a", oldLine: "", type: DiffRowType.Added }]);
    expect(toDiffRows("a\nb", "a")).toStrictEqual([
      { newLine: "a", oldLine: "a", type: DiffRowType.Unchanged },
      { newLine: "", oldLine: "b", type: DiffRowType.Removed },
    ]);
  });
});
