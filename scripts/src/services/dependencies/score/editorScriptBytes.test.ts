import { assertEditorScriptsWithinBudget } from "#src/services/dependencies/score/assertEditorScriptsWithinBudget";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(assertEditorScriptsWithinBudget, () => {
  test("an editor's script loads within the budget", () => {
    expect.hasAssertions();

    const editorScriptBytes = z
      .record(z.string(), z.number())
      .parse(parseMachineJson(readFileSync(join(import.meta.dirname, "editorScriptBytes.json"), "utf8")));
    expect(() => {
      assertEditorScriptsWithinBudget(editorScriptBytes);
    }).not.toThrow();
  });
});
