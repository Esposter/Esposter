import { DiffSide } from "@/models/agentConsole/DiffSide";
import { toDiffCommentsPrompt } from "@/services/agentConsole/toDiffCommentsPrompt";
import { describe, expect, test } from "vitest";

describe(toDiffCommentsPrompt, () => {
  test("names each comment's line, quotes it and marks a line that was removed", () => {
    expect.hasAssertions();

    expect(
      toDiffCommentsPrompt([
        { filePath: "a.ts", lineNumber: 3, lineText: "const b = 2;", side: DiffSide.New, text: "rename it" },
        { filePath: "a.ts", lineNumber: 2, lineText: "const c = 3;", side: DiffSide.Old, text: "why removed" },
      ]),
    ).toBe("a.ts:3\n> const b = 2;\nrename it\n\na.ts:2 (removed)\n> const c = 3;\nwhy removed");
  });
});
